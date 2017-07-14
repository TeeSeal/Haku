const { Inhibitor } = require('discord-akairo');
const { db } = _util;

async function exec(msg) {
  for (const scope of ['client', 'guild', 'channel']) {
    const [table, obj] = scope === 'client'
      ? ['client', this.client.user]
      : [`${scope}s`, msg[scope]];

    const blacklist = await db.get(table, obj, 'blacklist');
    if (blacklist[msg.author.id]) Promise.reject();
    if (scope === 'client' && msg.channel.type === 'dm') return Promise.resolve();
  }
  return Promise.resolve();
}

module.exports = new Inhibitor('blacklist', exec, { reason: 'blacklist' });
