import { MessageEmbed } from 'discord.js';
import { Command, RunFunction } from '../classes/Command';

const run: RunFunction = async ({ interaction, bot, permLevel, settings }) => {
  const availCommands = bot.commands.filter(
    (cmd) => cmd.permLevel <= permLevel
  );

  const sorted = availCommands
    .array()
    .sort((p, c) =>
      p.category > c.category
        ? 1
        : p.name > c.name && p.category === c.category
        ? 1
        : -1
    );

  let currentCategory = '';
  const embeds: MessageEmbed[] = [];
  let embedNum = 0;

  sorted.forEach((c) => {
    const cat = c.category;
    if (currentCategory !== cat) {
      if (currentCategory !== '') embedNum += 1;
      embeds[embedNum] = bot.embed(
        {
          title: `${cat} Commands`,
          description: ''
        },
        { settings }
      );
      currentCategory = cat;
    }
    embeds[embedNum].description += `**/${c.name}** - *${c.description}*\n`;
  });

  await bot.functions.paginate(interaction, embeds);
};

export const cmd = new Command()
  .setName('help')
  .setDescription('Gives all the commands available and their descriptions')
  .setNotdefered()
  .setRun(run);
