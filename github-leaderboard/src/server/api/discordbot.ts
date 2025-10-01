'use server';

import { startLeaderboardJob, stopLeaderboardJob } from './discordScheduler';
import { registerCommands } from './discordCommands'; // your registration function

let discordBot: any;

export async function getDiscordBot() {
  if (!discordBot) {
    const { Client, GatewayIntentBits, TextChannel, EmbedBuilder } = await import('discord.js');

    discordBot = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    await discordBot.login(process.env.DISCORD_BOT_TOKEN);

    discordBot.TextChannel = TextChannel;
    discordBot.EmbedBuilder = EmbedBuilder;

    discordBot.on("interactionCreate", async (interaction: any) => {
      if (!interaction.isCommand()) return;

      const { commandName, options } = interaction;

      if (commandName === "start") {
        const repo = options.getString("repo")!;
        const channel = options.getChannel("channel")!;
        startLeaderboardJob(repo, channel.id);
        await interaction.reply(`Started leaderboard for ${repo} in ${channel.name}`);
      }

      if (commandName === "stop") {
        stopLeaderboardJob();
        await interaction.reply(`Stopped leaderboard updates.`);
      }
    });
  }
  return discordBot;
}

export async function handleRegisterCommands(guildId: string) {
  const clientId = 
  "1422503631671791658";
  try {
    await registerCommands(clientId, guildId);
  } catch (err) {
    console.error(err);
  }
}

export async function sendLeaderboard(channelId: string, leaderboard: any[]) {
  const bot = await getDiscordBot();
  const channel = await bot.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;

  const sorted = leaderboard
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);

  const embed = new bot.EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("📊 Repository Leaderboard Update")
    .setTimestamp()
    .setFooter({ text: "RepoBoards Automation" });

  sorted.forEach((author, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
    embed.addFields({
      name: `${medal} ${author.author}`,
      value: `Impact score: ${author.qualityScore} | Commits: ${author.totalCommits} | +: ${author.linesAdded} | -: ${author.linesDeleted}`,
      inline: false
    });
  });

  if (sorted.length > 0) {
    embed.setDescription(`🏆 Winner: **${sorted[0].author}**`); 
    if (sorted[0].avatarUrl) {
      embed.setThumbnail(sorted[0].avatarUrl); 
    }
  }

  await (channel as InstanceType<typeof bot.TextChannel>).send({ embeds: [embed] });
}
