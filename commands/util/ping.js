const { Command } = require('discord-akairo');

function exec(msg) {
  return msg.util.reply('Pong!').then(sent => {
    const timeDiff = (sent.editedAt || sent.createdAt) - (msg.editedAt || msg.createdAt);
    const text = `🔂\u2000**RTT**: ${timeDiff} ms\n💟\u2000**Heartbeat**: ${Math.round(this.client.ping)} ms`;
    return msg.util.reply(`Pong!\n${text}`);
  });
}

module.exports = new Command('ping', exec, { aliases: ['ping', 'hello'] });
