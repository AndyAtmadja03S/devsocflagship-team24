import { sendLeaderboard } from './discordbot';
import { fetchGitHubCommits } from './githubapis/fetchCommit';

type JobKey = string;
const activeJobs = new Map<JobKey, NodeJS.Timeout>();

export function startLeaderboardJob(repoFullName: string, channelId: string) {
  const key = `${repoFullName}:${channelId}`;

  if (activeJobs.has(key)) return;

  const postLeaderboard = async () => {
    try {
      console.log(`[JOB] Posting leaderboard for ${repoFullName} → ${channelId}`);
      const leaderboard = await fetchGitHubCommits(repoFullName);
      await sendLeaderboard(channelId, leaderboard);
    } catch (err) {
      console.error("Error posting leaderboard:", err);
    }
  };

  postLeaderboard();

  const interval = setInterval(postLeaderboard, 30 * 60 * 1000); 
  activeJobs.set(key, interval);
  console.log(activeJobs);
}


export function stopLeaderboardJob() {
  for (const interval of activeJobs.values()) {
    clearInterval(interval);
  }
  activeJobs.clear();
  console.log(activeJobs)
}