const { Inhibitor } = require('discord-akairo');

function exec(msg) {
  const scopes = msg.guild ? ['client', 'guild', 'channel'] : ['client'];

  for (const scope of scopes) {
    const [table, id] = scope === 'client'
      ? [scope, 'haku'] : [`${scope}s`, msg[scope].id];

    if (this.client.db[table].get(id)
      .disabled.includes(msg.util.command.id)) return true;
  }
  return false;
}

module.exports = new Inhibitor('disabled', exec, { reason: 'disabled' });
