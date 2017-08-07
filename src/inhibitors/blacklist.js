const { Inhibitor } = require('discord-akairo');

function exec(msg) {
  if (msg.author.id === this.client.user.id) return false;
  const scopes = msg.guild ? ['client', 'guild', 'channel'] : ['client'];

  for (const scope of scopes) {
    const [table, id] = scope === 'client'
      ? [scope, 'haku'] : [`${scope}s`, msg[scope].id];

    if (this.client.db[table].get(id)
      .blacklist.includes(msg.author.id)) return true;
  }
  return false;
}

module.exports = new Inhibitor('blacklist', exec, { reason: 'blacklist' });
