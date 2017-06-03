const { Inhibitor } = require('discord-akairo');
const { db } = helpers;

async function exec(msg) {
  for (const scope of ['client', 'guild', 'channel']) {
    const [table, obj] = scope === 'client'
      ? ['client', msg.client.user]
      : [`${scope}s`, msg[scope]];

    const blacklist = await db.get(table, obj, 'blacklist');
    if (blacklist[msg.author.id]) Promise.reject();
  }
  return Promise.resolve();
}

module.exports = new Inhibitor('blacklist', exec, { reason: 'blacklist' });
