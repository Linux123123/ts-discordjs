import { Bot } from '../classes/Bot';
import { Command } from '../classes/Command';
import { Event } from '../types/Event';
import {
  CommandInteraction,
  Guild,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js';
import { GuildSettings } from '../types/GuildSettings';

export const defaultSettings: GuildSettings = {
  adminRole: 'NaN',
  modRole: 'NaN',
  embedColor: 'BLUE'
};

export class Functions {
  constructor(private readonly bot: Bot) {}
  private client = this.bot.discordClient;
  /* Loading commands */
  public async loadCommand(commandName: string): Promise<void> {
    try {
      this.bot.logger.log(`Loading Command: ${commandName}`);
      const { cmd }: { cmd: Command } = await import(
        `../commands/${commandName}`
      );
      if (cmd.permName !== 'User')
        cmd.permLevel = this.bot.levelCache[cmd.permName];
      this.bot.commands.set(cmd.name, cmd);
    } catch (e) {
      this.bot.logger.error(`Unable to load command ${commandName}`);
      console.error(e);
    }
  }
  /* Loading events */
  public async loadEvent(eventName: string): Promise<void> {
    try {
      this.bot.logger.log(`Loading Event: ${eventName}`);
      const event: Event = await import(`../events/${eventName}`);
      this.client.on(eventName, event.run.bind(null, this.bot));
    } catch (e) {
      this.bot.logger.error(`Unable to load event ${eventName}`);
      console.error(e);
    }
  }
  /* Registering slash commands */
  public async registerSlashCommands(
    cmds: Command[],
    guilds: Guild[]
  ): Promise<void> {
    try {
      const slashCommands = cmds.map((cmd) => cmd.toJSON());
      await Promise.all(
        guilds.map(async (guild) => {
          const commands = await guild.commands.set(slashCommands);
          const roles = await guild.roles.fetch();
          const settings = this.getSettings(guild);
          const adminRole = roles.find((r) => r.id === settings.adminRole);
          const modRole = roles.find((r) => r.id === settings.modRole);
          if (!adminRole || !modRole) {
            const cmd = commands.find((c) => c.name === 'set');
            if (!cmd)
              return this.bot.logger.error(
                "Critical Error: 'set' command not found"
              );
            const permLevels = this.bot.config.permLevels.filter(
              (p) => p.name === 'Bot Creator' || p.name === 'Server Owner'
            );
            const permissions = permLevels.map((p) =>
              p.getPermission({ settings, guild })
            );
            await cmd.permissions.add({
              permissions
            });
            return this.bot.logger.warn(
              'Unable to find roles. Set roles in server with /set as the server owner!'
            );
          } else {
            commands.forEach((cmd) => {
              const command = cmds.find((c) => c.name === cmd.name);
              if (command && !command.defaultPermission) {
                const permLevels = this.bot.config.permLevels.filter(
                  (p) => p.level >= command.permLevel
                );
                const permissions = permLevels.map((p) =>
                  p.getPermission({ settings, guild })
                );
                cmd.permissions.add({ permissions: permissions });
              }
            });
          }
        })
      );

      this.bot.logger.ready(`Successfully registered slash commands`);
    } catch (e) {
      this.bot.logger.error(`Unable to register commands`);
      console.error(e);
    }
  }
  /* Get guild specific settings */
  public getSettings(guild?: Guild): GuildSettings {
    this.bot.settings.ensure('default', defaultSettings);
    if (!guild) return defaultSettings;
    const guildConf = this.bot.settings.get(guild.id) || {};
    return { ...defaultSettings, ...guildConf };
  }
  /* PERMISSION LEVEL FUNCTION */
  public permlevel(
    interaction: CommandInteraction,
    settings: GuildSettings
  ): number {
    let permlvl = 0;

    const permOrder = this.bot.config.permLevels
      .slice(0)
      .sort((p, c) => (p.level < c.level ? 1 : -1));

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (!currentLevel) continue;
      if (currentLevel.check({ interaction, settings })) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }
  /* Permission error handling */
  public permissionError = async (
    interaction: CommandInteraction,
    level: number,
    levelName: string,
    cmd: Command
  ): Promise<void> => {
    const embed = this.bot.embed(
      {
        title: '🛑 You do not have permission to use this command. 🛑',
        fields: [
          {
            name: '\u200b',
            value: `**Your permission level is ${level} (${levelName})**`
          },
          {
            name: '\u200b',
            value: `**This command requires level ${cmd.permLevel} (${cmd.permName})**`
          }
        ]
      },
      { embedColor: 'RED' }
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  };
  /* Pagination */
  public paginate = async (
    interaction: CommandInteraction,
    embeds: MessageEmbed[]
  ): Promise<void> => {
    let page = 0;

    const backButton = new MessageButton({
      customId: 'back',
      style: 'SECONDARY',
      label: 'Back'
    });

    const nextButton = new MessageButton({
      customId: 'next',
      style: 'SECONDARY',
      label: 'Next'
    });

    const row = new MessageActionRow().addComponents([backButton, nextButton]);

    const curPage = (await interaction.reply({
      embeds: [embeds[page].setFooter(`Page ${page + 1} / ${embeds.length}`)],
      components: [row],
      fetchReply: true
    })) as Message;

    const filter = (i: MessageComponentInteraction) =>
      i.customId === 'back' || i.customId === 'next';

    const collector = curPage.createMessageComponentCollector({
      filter,
      time: 3600000
    });

    collector.on('collect', async (i) => {
      switch (i.customId) {
        case 'back':
          page = page > 0 ? --page : embeds.length - 1;
          break;
        case 'next':
          page = page + 1 < embeds.length ? ++page : 0;
          break;
        default:
          break;
      }
      await i.deferUpdate();
      await i.editReply({
        embeds: [embeds[page].setFooter(`Page ${page + 1} / ${embeds.length}`)],
        components: [row]
      });
      collector.resetTimer();
    });

    collector.on('end', () => {
      if (!curPage.deleted) {
        const disabledRow = new MessageActionRow().addComponents(
          backButton.setDisabled(true),
          nextButton.setDisabled(true)
        );
        curPage.edit({
          embeds: [
            embeds[page].setFooter(`Page ${page + 1} / ${embeds.length}`)
          ],
          components: [disabledRow]
        });
      }
    });
  };
}
