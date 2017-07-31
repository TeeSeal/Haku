const { Command } = require('discord-akairo');
const { db } = require('../../util/all.js');

async function exec(msg, args) {
  const { prefix } = args;
  if (!prefix) return msg.util.reply(`current prefix in this guild is: **${db.prefixes.get(msg.guild.id)}**`);
  if (!msg.member.permissions.has('MANAGE_GUILD')) return msg.util.error('you do not have permission to change the prefix in this guild.');

  db.update('guilds', { id: msg.guild.id, prefix });
  db.prefixes.set(msg.guild.id, prefix);

  return msg.util.success(`prefix updated to: **${prefix}**`);
}

module.exports = new Command('prefix', exec, {
  aliases: ['prefix', 'pre'],
  args: [
    {
      id: 'prefix',
      type: 'lowercase'
    }
  ],
  description: 'See or set the prefix in a guild.'
});
