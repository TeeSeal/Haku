const { Command } = require('discord-akairo');
const { db } = require('../../util.js');

async function exec(msg, args) {
  const { member, scope } = args;
  if (!member) return msg.util.reply('you need to specfy a user.');
  const id = member.id;

  if (scope === 'global') {
    if (msg.author.id !== msg.client.ownerID) {
      return msg.util.reply('only the bot owner can ignore globally.');
    }

    const exists = await db.table('blacklist').get(id);
    if (exists) return msg.util.reply(`${member.user.tag} is already ignored.`);

    await db.table('blacklist').insert({ id });
    return msg.util.reply(`added ${member.user.tag} to the blacklist.`);
  }

  if (scope === 'guild') {
    if (!msg.member.hasPermission('MANAGE_SERVER')) {
      return msg.util.reply('you do not have permission to ignore other members.');
    }

    const blacklist = await db.getBlacklist(msg.guild);
    if (blacklist.includes(id)) return msg.util.reply(`${member.user.tag} is already ignored.`);

    blacklist.push(id);
    await db.update('guild', { blacklist, id: msg.guild.id });
    return msg.util.reply(`added ${member.user.tag} to the guild blacklist.`);
  }
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
      type: 'lowercase',
      default: 'guild'
    }
  ]
});
