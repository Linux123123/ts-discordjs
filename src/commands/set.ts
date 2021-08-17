import { ColorResolvable, HexColorString } from 'discord.js';
import { Command, RunFunction } from '../classes/Command';
import { GuildSettings } from '../types/GuildSettings';

const run: RunFunction = async ({ interaction, settings, bot }) => {
  const modRole = interaction.options.getRole('modrole');
  const adminRole = interaction.options.getRole('adminrole');
  const embedColor = interaction.options.getString('embedcolor');

  if (!interaction.guild) return;
  if (!bot.settings.has(interaction.guild.id))
    bot.settings.set(interaction.guild.id, {} as GuildSettings);

  if (!modRole && !adminRole && !embedColor) {
    const aRole = await interaction.guild?.roles.fetch(settings.adminRole);
    const mRole = await interaction.guild?.roles.fetch(settings.modRole);
    const embed = bot.embed(
      {
        title: 'Settings',
        description: 'Admin configurable server settings',
        fields: [
          {
            name: 'Admin Role',
            value: aRole?.toString() ?? 'Role Not Found',
          },
          {
            name: 'Moderator Role',
            value: mRole?.toString() ?? 'Role Not Found',
          },
          {
            name: '⟵ Embed Color',
            value: settings.embedColor.toString().toLowerCase(),
          },
        ],
      },
      { settings }
    );
    return interaction.reply({ embeds: [embed] });
  }

  let text = '';

  if (adminRole) {
    bot.settings.set(interaction.guild.id, adminRole.id, 'adminRole');
    text += `Set Admin Role: ${adminRole.toString()}\n`;
  }

  if (modRole) {
    bot.settings.set(interaction.guild.id, modRole.id, 'modRole');
    text += `Set Moderator Role: ${modRole.toString()}\n`;
  }

  if (embedColor) {
    bot.settings.set(interaction.guild.id, embedColor, 'embedColor');
    settings.embedColor = embedColor as ColorResolvable;
    text += `Set Embed Color: ${embedColor.toLowerCase()}\n`;
  }

  const embed = bot.embed(
    {
      title: 'Successfully:',
      description: text,
    },
    { settings }
  );

  interaction.reply({ embeds: [embed] });
};

type choices = [
  name: string,
  value: Exclude<
    ColorResolvable,
    number | readonly [number, number, number] | HexColorString
  >
][];

const options: choices = [
  ['white', 'WHITE'],
  ['aqua', 'AQUA'],
  ['green', 'GREEN'],
  ['blue', 'BLUE'],
  ['yellow', 'YELLOW'],
  ['purple', 'PURPLE'],
  ['luminous_vivid_pink', 'LUMINOUS_VIVID_PINK'],
  ['fuchsia', 'FUCHSIA'],
  ['gold', 'GOLD'],
  ['orange', 'ORANGE'],
  ['red', 'RED'],
  ['grey', 'GREY'],
  ['darker_grey', 'DARKER_GREY'],
  ['navy', 'NAVY'],
  ['dark_green', 'DARK_GREEN'],
  ['dark_blue', 'DARK_BLUE'],
  ['dark_purple', 'DARK_PURPLE'],
  ['dark_vivid_pink', 'DARK_VIVID_PINK'],
  ['light_grey', 'LIGHT_GREY'],
  ['dark_navy', 'DARK_NAVY'],
  ['blurple', 'BLURPLE'],
  ['greyple', 'GREYPLE'],
  ['dark_but_not_black', 'DARK_BUT_NOT_BLACK'],
  ['not_quite_black', 'NOT_QUITE_BLACK'],
  ['random', 'RANDOM'],
];

export const cmd = new Command()
  .setName('set')
  .setDescription('Server settings')
  .setPermLevel('Administrator')
  .setRun(run)
  .addRoleOption((input) =>
    input.setName('adminrole').setDescription('Set the Admin role')
  )
  .addRoleOption((input) =>
    input.setName('modrole').setDescription('Set the moderator role')
  )
  .addStringOption((input) =>
    input
      .setName('embedcolor')
      .setDescription('Set the embed color')
      .addChoices(options)
  );
