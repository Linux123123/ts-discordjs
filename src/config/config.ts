import { Config, permCheckArgs } from '../types/Config';
import { config as dotenv } from 'dotenv';
import { GuildMemberRoleManager } from 'discord.js';

dotenv();

export const config: Config = {
  // Your Bot's Token. Available on https://discord.com/developers/applications/me
  discordToken: process.env.DISCORD_TOKEN ?? 'NOT_PROVIDED',
  // PERMISSION LEVEL DEFINITIONS.
  permLevels: [
    {
      level: 0,
      name: 'User',
      check: () => true,
      getPermission: ({ guild }) => {
        return { id: guild.roles.everyone.id, permission: true, type: 'ROLE' };
      }
    },
    {
      level: 2,
      name: 'Moderator',
      check: ({ interaction, settings }: permCheckArgs): boolean => {
        try {
          const modRole = interaction.guild?.roles.cache.find(
            (r) => r.id === settings.modRole
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
      getPermission: ({ settings }) => {
        return { id: settings.modRole, permission: true, type: 'ROLE' };
      }
    },
    {
      level: 3,
      name: 'Administrator',
      check: ({ interaction, settings }: permCheckArgs): boolean => {
        try {
          const adminRole = interaction.guild?.roles.cache.find(
            (r) => r.id === settings.adminRole
          );
          if (!adminRole) return false;
          return (
            interaction.member?.roles as GuildMemberRoleManager
          ).cache.has(adminRole.id);
        } catch (e) {
          return false;
        }
      },
      getPermission: ({ settings }) => {
        return { id: settings.adminRole, permission: true, type: 'ROLE' };
      }
    },
    {
      level: 4,
      name: 'Server Owner',
      check: ({ interaction }) =>
        interaction.guild?.ownerId === interaction.user.id,
      getPermission: ({ guild }) => {
        return { id: guild.ownerId, permission: true, type: 'USER' };
      }
    },
    {
      level: 10,
      name: 'Bot Creator',
      check: ({ interaction }) => '244024524289343489' === interaction.user.id,
      getPermission: () => {
        return { id: '244024524289343489', permission: true, type: 'USER' };
      }
    }
  ]
};
