import { CommandInteraction } from 'discord.js';
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

export interface permObject {
  level: number;
  name: string;
  check: permCheck;
}

export interface Config {
  discordToken: string;
  permLevels: permObject[];
}
