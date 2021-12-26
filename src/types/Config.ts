import {
  ApplicationCommandPermissionData,
  CommandInteraction,
  Guild
} from 'discord.js';
import { GuildSettings } from './GuildSettings';

export type permCheckArgs = {
  interaction: CommandInteraction;
  settings: GuildSettings;
};

export interface permCheck {
  (options: {
    interaction: CommandInteraction;
    settings: GuildSettings;
  }): boolean;
}

export interface getPermission {
  (options: {
    settings: GuildSettings;
    guild: Guild;
  }): ApplicationCommandPermissionData;
}

export interface permObject {
  level: number;
  name: string;
  check: permCheck;
  getPermission: getPermission;
}

export interface Config {
  discordToken: string;
  permLevels: permObject[];
}
