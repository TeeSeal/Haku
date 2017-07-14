const { Inhibitor } = require('discord-akairo');
const { db } = _util;

async function exec(msg) {
  if (msg.channel.type === 'dm') return Promise.resolve();
  for (const scope of ['guild', 'channel']) {
    const [table, obj] = scope === 'client'
      ? ['client', this.client.user]
      : [`${scope}s`, msg[scope]];

    const disabled = await db.get(table, obj, 'disabled');
    if (disabled[msg.util.command.id]) return Promise.reject();
  }
  return Promise.resolve();
}

module.exports = new Inhibitor('disabled', exec, { reason: 'disabled' });
