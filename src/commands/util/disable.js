const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/all.js');

const forbidden = ['enable'];
const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.permissions.has('MANAGE_GUILD'),
  channel: (member) => member.permissions.has('MANAGE_CHANNLES')
};

function exec(msg, args) {
  const { command, scope } = args;
  if (!command) return msg.util.error('you need to specfy a command to disable.');
  if (forbidden.includes(command.id)) return msg.util.error(`you can't disable **${command.id}**.`);
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to disable commands in that scope.');
  }

  const [table, id] = scope === 'client'
    ? [`${scope}s`, msg[scope]] : [scope, 'haku'];
  const db = this.client.db[table];
  const { disabled } = db.get(id);

  if (disabled.includes(command.id)) return msg.util.error(`**${command.id}** is already disabled in this ${scope}.`);

  disabled.push(command.id);
  db.set(id, { disabled });
  return msg.util.success(`**${command.id}** has been disabled in this ${scope}.`);
}

module.exports = new Command('disable', exec, {
  aliases: ['disable'],
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
    Disable a command.
    **Optional arguments:**
    \`scope\` - the scope in which to disable the command (defaults to guild).

    **Usage:**
    \`disable ping\` => disables the ping command in the guild.
    \`disable ping channel\` => disables the ping command in the channel.
  `
});
