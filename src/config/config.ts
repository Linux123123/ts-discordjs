import { Config, permCheckArgs } from '../types/Config';
import { config as dotenv } from 'dotenv';
import { GuildMemberRoleManager } from 'discord.js';

dotenv();

export const config: Config = {
  // Your Bot's Token. Available on https://discord.com/developers/applications/me
  discordToken: process.env.DISCORD_TOKEN ?? 'NOT_PROVIDED',
  // PERMISSION LEVEL DEFINITIONS.
  permLevels: [
    // This is the lowest permisison level, this is for non-roled users.
    {
      level: 0,
      name: 'User',
      // Don't bother checking, just return true which allows them to execute any command their
      // level allows them to.
      check: () => true,
    },
    // This is your permission level, the staff levels should always be above the rest of the roles.
    {
      level: 2,
      // This is the name of the role.
      name: 'Moderator',
      // The following lines check the guild the message came from for the roles.
      // Then it checks if the member that authored the message has the role.
      // If they do return true, which will allow them to execute the command in question.
      // If they don't then return false, which will prevent them from executing the command.
      check: ({ interaction, settings }: permCheckArgs): boolean => {
        try {
          const modRole = interaction.guild?.roles.cache.find(
            (r) => r.name.toLowerCase() === settings.modRole.toLowerCase()
          );
          if (
            modRole &&
            (interaction.member?.roles as GuildMemberRoleManager).cache.has(
              modRole.id
            )
          )
            return true;
          return false;
        } catch (e) {
          return false;
        }
      },
    },
    {
      level: 3,
      name: 'Administrator',
      check: ({ interaction, settings }: permCheckArgs): boolean => {
        try {
          const adminRole = interaction.guild?.roles.cache.find(
            (r) => r.name.toLowerCase() === settings.adminRole.toLowerCase()
          );
          if (!adminRole) return false;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return (
            interaction.member?.roles as GuildMemberRoleManager
          ).cache.has(adminRole.id);
        } catch (e) {
          return false;
        }
      },
    },
    // This is the server owner.
    {
      level: 4,
      name: 'Server Owner',
      // Simple check, if the guild owner id matches the message author's ID, then it will return true.
      // Otherwise it will return false.
      check: ({ interaction }) =>
        interaction.guild?.ownerId === interaction.user.id,
    },
    {
      level: 10,
      name: 'Bot Creator',
      // Another simple check, compares the message author id to the one stored in the config file.
      // Do not change !
      check: ({ interaction }) => '244024524289343489' === interaction.user.id,
    },
  ],
};
