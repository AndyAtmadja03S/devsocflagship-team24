// src/server/github/fetchCommits.ts
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function fetchGitHubCommits(repoFullName: string) {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid repoFullName. Must be in 'owner/repo' format.");
	}
  let commits: any[] = [];
  let page = 1;
  const perPage = 100;

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
        files: full.data.files?.map((f) => ({
          filename: f.filename,
          additions: f.additions,
          deletions: f.deletions,
          patch: f.patch || "",
        })),
      }))
    );

    page++;
  }

  return commits;
}
