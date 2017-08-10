const { Command } = require('discord-akairo');
const { stripIndents, getDBData } = require('../../util/all.js');

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guilds: (member) => member.permissions.has('MANAGE_GUILD'),
  channels: (member) => member.permissions.has('MANAGE_CHANNELS')
};

function exec(msg, args) {
  const { command, scope } = args;
  if (!command) return msg.util.error('you need to specfy a command to enable.');

  const [table, id, formattedScope] = getDBData(msg, scope);
  if (!permCheck[table](msg.member)) {
    return msg.util.error(`you do not have permission to enable commands ${formattedScope}.`);
  }

  const db = this.client.db[table];
  const { disabled } = db.get(id);

  if (!disabled.includes(command.id)) return msg.util.error(`**${command.id}** is not disabled ${formattedScope}.`);

  disabled.splice(disabled.indexOf(command.id), 1);
  db.set(id, { disabled });
  return msg.util.success(`**${command.id}** has been enabled ${formattedScope}.`);
}

module.exports = new Command('enable', exec, {
  aliases: ['enable'],
  args: [
    {
      id: 'command',
      type: 'command'
    },
    {
      id: 'scope',
      type: ['globally', 'guild', 'channel'],
      default: 'guild'
    }
  ],
  description: stripIndents`
    Enable a disabled command.
    **Optional arguments:**
    \`scope\` - the scope in which to enable a command (defaults to guild).

    **Usage:**
    \`enable ping\` => enables the ping command in the guild.
    \`enable ping channel\` => enables the ping command in the channel.
  `
});
