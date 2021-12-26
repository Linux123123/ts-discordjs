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
    // Not needed as using slash commands gives a way to validate permissions,
    // but may be good to protect against some kind of error
    // where permissions are not checked
    if (permLevel < cmd.permLevel) {
      return await bot.functions.permissionError(
        interaction,
        permLevel,
        permName,
        cmd
      );
    }

    cmd.defer && (await interaction.deferReply({ ephemeral: cmd.ephemeral }));

    bot.logger.cmd(
      `${permName} ${interaction.user.username} (${interaction.user.id}) ran command ${cmd.name}`
    );

    cmd.run({ bot, interaction, settings, permLevel, permName });
  }
};
