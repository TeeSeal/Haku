const { Command } = require('discord-akairo');
const { stripIndents } = helpers;
async function exec(msg, args) {
  const { command } = args;
  if (command) return msg.util.send(command.description);

  const list = this.handler.modules.filter(cmd => !cmd.ownerOnly).map(cmd => {
    let string = `**${cmd.id}** | ${cmd.description.split('\n')[0]}`;
    if (cmd.aliases.length > 1) string += `\nAliases: ${cmd.aliases.slice(1).map(a => `\`${a}\``).join(', ')}`;
    return string;
  }).join('\n\n');

  msg.author.send(stripIndents`
    **Haku commands**:
    Use \`help command\` to view more detailed info on a command.

    ${list}
  `);
  return msg.util.reply('sent you a DM with info.');
}

module.exports = new Command('help', exec, {
  aliases: ['help'],
  args: [
    {
      id: 'command',
      type: 'command'
    }
  ],
  description: 'Get help.'
});
