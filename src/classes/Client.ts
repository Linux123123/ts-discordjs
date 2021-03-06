import enmap from 'enmap';
import { Client, Intents, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { Config, permObject } from '../interfaces/Config';
import { readdir } from 'fs';
import { promisify } from 'util';
import { Logger } from '../modules/Logger';
import { handleExceptions } from '../modules/handleExceptions';
import { GuildSettings } from '../interfaces/GuildSettings';
import { Functions } from '../modules/functions';
import { Command } from '../interfaces/Command';
import { Message } from './Message';

const readAsyncDir = promisify(readdir);

export class Bot extends Client {
    public constructor(public readonly config: Config) {
        super({ ws: { intents: Intents.NON_PRIVILEGED } });
    }
    public commands: enmap<string, Command> = new enmap();
    public aliases: enmap<string, string> = new enmap();
    public settings: enmap<string, GuildSettings> = new enmap('settings');
    public levelCache: { [key: string]: number } = {};
    public functions = new Functions();
    public logger = new Logger();
    public async start(): Promise<void> {
        handleExceptions(this);
        this.login(this.config.token);
        const cmdFiles = await readAsyncDir(`${__dirname}/../commands`);
        const eventFiles = await readAsyncDir(`${__dirname}/../events`);
        cmdFiles.forEach((cmd) => {
            this.functions.loadCommand(this, cmd.split('.')[0]);
        });
        eventFiles.forEach((event) => {
            this.functions.loadEvent(this, event.split('.')[0]);
        });
        for (let i = 0; i < this.config.permLevels.length; i++) {
            const thisLevel: permObject = this.config.permLevels[i];
            this.levelCache[thisLevel.name] = thisLevel.level;
        }
    }
    public embed(
        data: MessageEmbedOptions,
        message?: Message,
        embedColor = '#0000FF',
    ): MessageEmbed {
        return new MessageEmbed({
            ...data,
            color: message ? message.settings.embedColor : embedColor,
            timestamp: new Date(),
        });
    }
}
