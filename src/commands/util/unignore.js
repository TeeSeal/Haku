const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/all.js');

const permCheck = {
  client: (member) => member.id === member.client.ownerID,
  guild: (member) => member.permissions.has('MANAGE_GUILD'),
  channel: (member) => member.permissions.has('MANAGE_CHANNLES')
};

function exec(msg, args) {
  const { member, scope } = args;
  if (!member) return msg.util.error('you need to specfy a member to unignore.');
  if (!permCheck[scope](msg.member)) {
    return msg.util.error('you do not have permission to unignore members in that scope.');
  }

  const [table, id] = scope === 'client'
    ? [`${scope}s`, msg[scope]] : [scope, 'haku'];
  const db = this.client.db[table];
  const { blacklist } = db.get(id);

  if (!blacklist.includes(member.id)) return msg.util.error(`**${member.displayName}** is not ignored in this ${scope}.`);

  blacklist.splice(blacklist.indexOf(member.id), 1);
  db.set(id, { blacklist });
  return msg.util.success(`**${member.displayName}** has been unignored in this ${scope}.`);
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
    **Optional arguments:** \`scope\`
    \`scope\` - the scope in which to unignore the user (defaults to guild).

    **Usage:**
    \`unignore TeeSeal\` => unignores the user in the current guild.
    \`unignore TeeSeal channel\` => unignores the user in the current channel.
  `
});
