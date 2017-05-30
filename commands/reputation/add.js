const { Command } = require('discord-akairo');
const { db } = require('../../util.js');

async function exec(msg, args) {
  const { member } = args;
  if (!member) return msg.util.reply('you need to specify a user.');
  await db.rep(member, 1);
  return msg.util.reply(`added 1 rep to **${member.displayName}**`);
}

module.exports = new Command('rep+', exec, {
  aliases: ['rep+', 'rep++'],
  args: [
    {
      id: 'member',
      type: 'member'
    }
  ]
});
