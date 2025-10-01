export async function postLeaderboardToDiscord(repoFullName: string, channelId: string) {
  try {
    const res = await fetch('/api/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ repoFullName, channelId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to post leaderboard');

    console.log('Leaderboard posted to Discord!', data);
  } catch (err) {
    console.error('Error posting leaderboard to Discord:', err);
  }
}
