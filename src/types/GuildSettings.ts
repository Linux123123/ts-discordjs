import { ColorResolvable } from 'discord.js';

export interface GuildSettings {
  adminRole: string;
  modRole: string;
  embedColor: ColorResolvable;
}
