import { Interaction } from 'discord.js';
import { RunFunction } from '../types/Event';

export const run: RunFunction = async (bot, interaction: Interaction) => {
  if (interaction.isCommand()) {
    if (!interaction.guild) return;
    const { commandName } = interaction;
    const cmd = bot.commands.get(commandName);
    if (!cmd) return;

    const settings = bot.functions.getSettings(interaction.guild);

    if (!interaction.member) {
      await interaction.guild.members.fetch(interaction.user);
    }

    const permLevel = bot.functions.permlevel(interaction, settings);
    const permName =
      bot.config.permLevels.find((l) => l.level === permLevel)?.name ??
      'Unknown';

    // Check permissions
    if (permLevel < bot.levelCache[cmd.permLevel]) {
      return await bot.functions.permissionError(
        interaction,
        permLevel,
        permName,
        cmd
      );
    }

    bot.logger.cmd(
      `${permName} ${interaction.user.username} (${interaction.user.id}) ran command ${cmd.name}`
    );

    cmd.run({ bot, interaction, settings, permLevel, permName });
  }
};
