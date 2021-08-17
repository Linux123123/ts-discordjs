import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { GuildSettings } from '../types/GuildSettings';
import { Bot } from './Bot';

export interface RunFunction {
  (options: {
    bot: Bot;
    interaction: CommandInteraction;
    settings: GuildSettings;
    permLevel: number;
    permName: string;
  }): Promise<unknown>;
}

export interface SetupFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (bot: Bot, ...params: any[]): Promise<unknown>;
}

export class Command extends SlashCommandBuilder {
  constructor() {
    super();
  }
  public permLevel = 'User';
  public category = 'Miscelaneous';
  public run!: RunFunction;
  public setup?: SetupFunction;

  public setPermLevel = (permLevel: string): this => {
    this.permLevel = permLevel;
    return this;
  };

  public setCategory = (category: string): this => {
    this.category = category;
    return this;
  };

  public setRun = (run: RunFunction): this => {
    this.run = run;
    return this;
  };

  public setSetup = (setup: SetupFunction): this => {
    this.setup = setup;
    return this;
  };
}
