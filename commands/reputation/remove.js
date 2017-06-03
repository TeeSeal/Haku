const { Command } = require('discord-akairo');
const { db } = helpers;

async function exec(msg, args) {
  const { member } = args;
  if (!member) return msg.util.reply('you need to specify a user.');
  await db.rep(member, -1);
  return msg.util.reply(`removed 1 rep from **${member.displayName}**`);
}

module.exports = new Command('rep-', exec, {
  aliases: ['rep-', 'rep--'],
  args: [
    {
      id: 'member',
      type: 'member'
    }
  ],
  description: 'Remove some rep from a user.'
});
