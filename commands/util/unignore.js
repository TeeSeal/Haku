const { Command } = require('discord-akairo');
const { db } = helpers;

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.hasPermission('MANAGE_SERVER'),
  channel: (member) => member.hasPermission('MANAGE_CHANNLES')
};

async function exec(msg, args) {
  const { member, scope } = args;
  if (!member) return msg.util.error('couldn\'t find member or no member specified.');
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to ignore in that scope.');
  }

  const [table, obj] = scope === 'client' ? ['client', msg.client.user] : [`${scope}s`, msg[scope]];
  const blacklist = await db.get(table, obj, 'blacklist');

  if (!blacklist[member.id]) return msg.util.error(`**${member.user.tag}** is not ignored for this ${scope}.`);

  blacklist[member.id] = false;
  await db.update(table, { id: obj.id, blacklist });
  return msg.util.success(`**${member.user.tag}** has been removed from the blacklist of this ${scope}.`);
}

module.exports = new Command('unignore', exec, {
  aliases: ['unignore', 'whitelist'],
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
    Unignore an ignored user.
    Optional arguments: \`scope\`
    Defaults to guild.

    **Usage:**
    \`unignore TeeSeal\` => unignores the user in the current guild.
    \`unignore TeeSeal channel\` => unignores the user in the current channel.
  `
});
