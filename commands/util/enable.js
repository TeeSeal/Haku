const { Command } = require('discord-akairo');
const { db } = require('../../util.js');

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.hasPermission('MANAGE_SERVER'),
  channel: (member) => member.hasPermission('MANAGE_CHANNLES')
};

async function exec(msg, args) {
  const { command, scope } = args;
  if (!command) return msg.util.error('you need to specfy a command to enable.');
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to enable commands in that scope.');
  }

  const [table, obj] = scope === 'client' ? ['client', msg.client.user] : [`${scope}s`, msg[scope]];
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
  ]
});
