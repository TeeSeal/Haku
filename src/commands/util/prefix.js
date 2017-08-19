const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/Util.js');

async function exec(msg, args) {
  const { prefix } = args;
  if (!prefix) {
    return msg.util.reply(stripIndents`
    current prefix in this guild is: **${this.client.db.guilds.get(msg.guild.id).prefix}**
  `);
  }
  if (!msg.member.permissions.has('MANAGE_GUILD')) return msg.util.error('you do not have permission to change the prefix in this guild.');

  this.client.db.guilds.set(msg.guild.id, { prefix });

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
