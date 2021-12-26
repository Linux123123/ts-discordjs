import enmap from 'enmap';
import {
  Client,
  ColorResolvable,
  Intents,
  MessageEmbed,
  MessageEmbedOptions
} from 'discord.js';
import { readdir } from 'fs';
import { promisify } from 'util';
import { Functions } from '../modules/Functions';
import { handleExceptions } from '../modules/handleExceptions';
import { Logger } from '../modules/Logger';
import { Config, permObject } from '../types/Config';
import { Command } from './Command';
import { GuildSettings } from '../types/GuildSettings';

const readAsyncDir = promisify(readdir);

export class Bot {
  constructor(public readonly config: Config) {}
  public discordClient = new Client({ intents: Intents.FLAGS.GUILDS });
  public commands: enmap<string, Command> = new enmap();
  public aliases: enmap<string, string> = new enmap();
  public settings: enmap<string, GuildSettings> = new enmap('settings');
  public levelCache: { [key: string]: number } = {};
  public functions = new Functions(this);
  public logger = new Logger();
  public start = async (): Promise<void> => {
    handleExceptions(this);
    for (let i = 0; i < this.config.permLevels.length; i++) {
      const thisLevel: permObject = this.config.permLevels[i];
      this.levelCache[thisLevel.name] = thisLevel.level;
    }
    const cmdFiles = await readAsyncDir(`${__dirname}/../commands`);
    const eventFiles = await readAsyncDir(`${__dirname}/../events`);
    cmdFiles.forEach((cmd) => {
      this.functions.loadCommand(cmd.split('.')[0]);
    });
    eventFiles.forEach((event: string) =>
      this.functions.loadEvent(event.split('.')[0])
    );
    await this.discordClient.login(this.config.discordToken);
    await this.discordClient.guilds.fetch();
    await this.functions.registerSlashCommands(
      this.commands.array(),
      this.discordClient.guilds.cache.map((guild) => guild)
    );
  };

  public embed(
    data: MessageEmbedOptions,
    options?: { settings?: GuildSettings; embedColor?: ColorResolvable }
  ): MessageEmbed {
    return new MessageEmbed({
      ...data,
      color: options?.settings?.embedColor ?? options?.embedColor ?? '#0000FF',
      timestamp: new Date()
    });
  }
}
