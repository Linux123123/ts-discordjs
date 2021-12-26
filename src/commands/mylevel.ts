import { Command, RunFunction } from '../classes/Command';

const run: RunFunction = async ({ interaction, permLevel, permName }) => {
  interaction.editReply({
    content: `Your permission level is: ${permLevel} - ${permName}`,
  });
};

export const cmd = new Command()
  .setName('mylevel')
  .setDescription('Gives your permission level')
  .setRun(run);
