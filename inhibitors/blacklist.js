const { Inhibitor } = require('discord-akairo');
const { db } = require('../util.js');

async function exec(msg) {
  const blacklist = await db.getBlacklist();
  if (blacklist.includes(msg.author.id)) return true;
  if (msg.channel.type === 'dm') return false;

  const guildBlacklist = await db.getBlacklist(msg.guild);
  return guildBlacklist.includes(msg.author.id);
}

module.exports = new Inhibitor('blacklist', exec, { reason: 'blacklist' });
