const { Command } = require('discord-akairo');
const { db, stripIndents } = require('../../util/all.js');

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.permissions.has('MANAGE_GUILD'),
  channel: (member) => member.permissions.has('MANAGE_CHANNLES')
};

async function exec(msg, args) {
  const { member, scope } = args;
  if (!member) return msg.util.error('you need to specfy a user.');
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to ignore in that scope.');
  }

  const [table, obj] = scope === 'client' ? ['client', this.client.user] : [`${scope}s`, msg[scope]];
  const blacklist = await db.get(table, obj, 'blacklist');

  if (blacklist[member.id]) return msg.util.error(`**${member.user.tag}** is already ignored for this ${scope}.`);

  blacklist[member.id] = true;
  await db.update(table, { id: obj.id, blacklist });
  return msg.util.success(`**${member.user.tag}** has been added to the blacklist of this ${scope}.`);
}

module.exports = new Command('ignore', exec, {
  aliases: ['ignore', 'blacklist'],
  args: [
    {
      id: 'member',
      type: 'member'
    },
    {
      id: 'scope',
      type: ['client', 'guild', 'channel'],
      default: 'guild'
    }
  ],
  description: stripIndents`
    Prevent a user from using commands.
    **Optional arguments:**
    \`scope\` - the scope in which to ignore the user (defaults to guild).

    **Usage:**
    \`ignore TeeSeal\` => ignores the user in the current guild.
    \`ignore TeeSeal channel\` => ignores the user in the current channel.
  `
});
