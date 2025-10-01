import { REST, Routes } from 'discord.js';

const commands = [
  {
    name: 'start',
    description: 'Start posting leaderboard for a repo',
    options: [
      {
        name: 'repo',
        type: 3, // STRING
        description: 'Full repo name (e.g., user/repo)',
        required: true,
      },
      {
        name: 'channel',
        type: 7, // CHANNEL
        description: 'Text channel to post leaderboard',
        required: true,
      },
    ],
  },
  {
    name: 'stop',
    description: 'Stop posting leaderboard for a repo',
  },
];

export async function registerCommands(clientId: string, guildId: string) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    console.log('Registering commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Commands registered!');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
}
