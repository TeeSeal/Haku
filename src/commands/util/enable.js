const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/all.js');

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.permissions.has('MANAGE_GUILD'),
  channel: (member) => member.permissions.has('MANAGE_CHANNLES')
};

function exec(msg, args) {
  const { command, scope } = args;
  if (!command) return msg.util.error('you need to specfy a command to enable.');
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to enable commands in that scope.');
  }

  const [table, id] = scope === 'client'
    ? [`${scope}s`, msg[scope]] : [scope, 'haku'];
  const db = this.client.db[table];
  const { disabled } = db.get(id);

  if (!disabled.includes(command.id)) return msg.util.error(`**${command.id}** is not disabled in this ${scope}.`);

  disabled.splice(disabled.indexOf(command.id), 1);
  db.set(id, { disabled });
  return msg.util.success(`**${command.id}** has been enabled in this ${scope}.`);
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
      type: ['client', 'guild', 'channel'],
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
