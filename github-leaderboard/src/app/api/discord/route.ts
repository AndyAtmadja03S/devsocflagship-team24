import { NextResponse } from 'next/server';
import { sendLeaderboard } from '~/server/api/discordbot';
import { fetchGitHubCommits } from '~/server/api/githubapis/fetchCommit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { repoFullName, channelId } = await req.json();
    const leaderboard = await fetchGitHubCommits(repoFullName);

    await sendLeaderboard(channelId, leaderboard);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
