// src/server/github/fetchCommits.ts
import { Octokit } from "octokit";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function assessPatchesQuality(files: { filename: string; patch: string }[]) {
  try {
    const prompt = files.map((f, i) => `
File #${i+1}: ${f.filename}
Patch:
${f.patch}
    `).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Analyze the following code patch. 
      You can assume the rest of the file context, but only judge the patch itself.

      Rate the quality of the patch on a scale from 0 to 10 where:
      - 0 = very poor quality
      - 10 = excellent quality

      Consider purpose, readability, efficiency, and maintainability.

      Return ONLY a valid JSON object with the following fields:
      {
        "score": number,       // numeric quality score (0-10)
        "reasoning": string    // short reasoning (1-2 sentences)
      }

      Code patches:
      ${prompt}`
      }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { score: null, reasoning: "No response from AI" };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error assessing patch quality:", error);
    return { score: null, reasoning: "Error assessing quality" };
  }
}

export async function fetchGitHubCommits(repoFullName: string) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid repoFullName. Must be in 'owner/repo' format.");
  }
  
  let commits: any[] = [];
  let page = 1;
  const perPage = 10;

  while (true) {
    // List commits per page
    const response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: perPage,
      page,
    });

    if (response.data.length === 0) break;

    // Fetch commit details (stats + files) in parallel
    const commitDetails = await Promise.all(
      response.data.map((c) =>
        octokit.rest.repos.getCommit({ owner, repo, ref: c.sha })
      )
    );

    // Map to commits obj including patch
    commits.push(
      ...commitDetails.map((full) => ({
        sha: full.data.sha,
        message: full.data.commit.message,
        date: full.data.commit.author?.date || "",
        author:
          full.data.author?.login || full.data.commit.author?.name || "Unknown",
        additions: full.data.stats?.additions || 0,
        deletions: full.data.stats?.deletions || 0,
        netChanges: (full.data.stats?.additions || 0) - (full.data.stats?.deletions || 0),
        files: full.data.files?.map((f) => ({
          filename: f.filename,
          patch: f.patch || "",
        })),
      }))
    );

    page++;
  }

  // Group commits by author and calculate stats
  const commitsByAuthor = commits.reduce((acc, commit) => {
    if (!acc[commit.author]) {
      acc[commit.author] = {
        commits: [],
        totalCommits: 0,
        totalDelta: 0,
      };
    }
    acc[commit.author].commits.push(commit);
    acc[commit.author].totalCommits += 1;
    acc[commit.author].totalDelta += commit.netChanges;
    return acc;
  }, {} as Record<string, { commits: typeof commits; totalCommits: number; totalDelta: number }>);

  // Find commit with max net changes for each author and assess quality
  const authorStats = await Promise.all(
    Object.entries(commitsByAuthor).map(async ([author, data]) => {
      const maxCommit = data.commits.reduce((max, current) => 
        Math.abs(current.netChanges) > Math.abs(max.netChanges) ? current : max
      );

      let qualityScore = null;
      let reasoning = "";

      if (maxCommit.files && maxCommit.files.length > 0) {
        const filesWithPatches = maxCommit.files.filter((f: any) => f.patch);
        
        if (filesWithPatches.length > 0) {
          const assessment = await assessPatchesQuality(filesWithPatches);
          qualityScore = assessment.score ?? null;
          reasoning = assessment.reasoning ?? "";
        }
      }

      return {
        author,
        qualityScore,
        reasoning,
        totalCommits: data.totalCommits,
        totalDelta: data.totalDelta,
      };
    })
  );

  return authorStats;
}