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
  public defaultPermission = true;
  public permName = 'User';
  public permLevel = 0;
  public category = 'Miscelaneous';
  public ephemeral = true;
  public defer = true;
  public run!: RunFunction;
  public setup?: SetupFunction;

  public setNotdefered = (): this => {
    this.defer = false;
    this.ephemeral = false;
    return this;
  };

  public setNotEphemeral = (): this => {
    this.ephemeral = false;
    return this;
  };

  public setPermName = (permName: string): this => {
    this.permName = permName;
    this.defaultPermission = false;
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
