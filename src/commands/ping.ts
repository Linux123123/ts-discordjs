import { Command, RunFunction } from '../classes/Command';

const run: RunFunction = async ({ bot, interaction, settings }) => {
  const embed = bot.embed(
    {
      title: '**🏓 PONG!**',
      fields: [
        {
          name: 'Discord API Latency',
          value: `**${Math.round(bot.discordClient.ws.ping)}ms**`,
        },
      ],
    },
    { settings }
  );
  interaction.editReply({ embeds: [embed] });
};

export const cmd = new Command()
  .setName('ping')
  .setDescription('Bot latency')
  .setRun(run);
