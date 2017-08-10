const { Command } = require('discord-akairo');
const { stripIndents, getDBData } = require('../../util/all.js');

const forbidden = ['enable'];
const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guilds: (member) => member.permissions.has('MANAGE_GUILD'),
  channels: (member) => member.permissions.has('MANAGE_CHANNELS')
};

function exec(msg, args) {
  const { command, scope } = args;
  if (!command) return msg.util.error('you need to specfy a command to disable.');
  if (forbidden.includes(command.id)) return msg.util.error(`you can't disable **${command.id}**.`);

  const [table, id, formattedScope] = getDBData(msg, scope);
  if (!permCheck[table](msg.member)) {
    return msg.util.error(`you do not have permission to enable commands ${formattedScope}.`);
  }

  const db = this.client.db[table];
  const { disabled } = db.get(id);

  if (disabled.includes(command.id)) return msg.util.error(`**${command.id}** is already disabled ${formattedScope}.`);

  disabled.push(command.id);
  db.set(id, { disabled });
  return msg.util.success(`**${command.id}** has been disabled ${formattedScope}.`);
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
      type: ['globally', 'guild', 'channel'],
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
