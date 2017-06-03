const { Inhibitor } = require('discord-akairo');
const { db } = helpers;

async function exec(msg) {
  for (const scope of ['client', 'guild', 'channel']) {
    const [table, obj] = scope === 'client'
      ? ['client', msg.client.user]
      : [`${scope}s`, msg[scope]];

    const disabled = await db.get(table, obj, 'disabled');
    if (disabled[msg.util.command.id]) return Promise.reject();
  }
  return Promise.resolve();
}

module.exports = new Inhibitor('disabled', exec, { reason: 'disabled' });
