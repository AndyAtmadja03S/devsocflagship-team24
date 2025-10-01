import { sendLeaderboard } from './discordbot';
import { fetchGitHubCommits } from './githubapis/fetchCommit';

type JobKey = string;
const activeJobs = new Map<JobKey, NodeJS.Timeout>();

export function startLeaderboardJob(repoFullName: string, channelId: string) {
  const key = `${repoFullName}:${channelId}`;

  if (activeJobs.has(key)) return;

  const interval = setInterval(async () => {
    try {
      console.log(`[JOB] Posting leaderboard for ${repoFullName} → ${channelId}`);
      const leaderboard = await fetchGitHubCommits(repoFullName);
      await sendLeaderboard(channelId, leaderboard);
    } catch (err) {
      console.error("Error posting leaderboard:", err);
    }
  }, 30 * 60 * 1000); 

  activeJobs.set(key, interval);
}

// export function stopLeaderboardJob(repoFullName: string, channelId: string) {
//   const key = `${repoFullName}:${channelId}`;
//   const interval = activeJobs.get(key);
//   if (interval) {
//     clearInterval(interval);
//     activeJobs.delete(key);
//   }
// }
