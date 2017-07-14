const { Command } = require('discord-akairo');
const { db, stripIndents } = _util;

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.permissions.has('MANAGE_GUILD'),
  channel: (member) => member.permissions.has('MANAGE_CHANNLES')
};

async function exec(msg, args) {
  const { command, scope } = args;
  if (!command) return msg.util.error('you need to specfy a command to enable.');
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to enable commands in that scope.');
  }

  if (scope === 'client') {
    command.enable();
    return msg.util.success(`**${command.id}** has been enabled in this ${scope}.`);
  }

  const [table, obj] = [`${scope}s`, msg[scope]];
  const disabled = await db.get(table, obj, 'disabled');

  if (!disabled[command.id]) return msg.util.error(`**${command.id}** is already enabled for this ${scope}.`);

  disabled[command.id] = false;
  await db.update(table, { id: obj.id, disabled });
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
