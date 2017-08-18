const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);
  if (!playlist) return msg.util.error('nothing is currently playing.');
  return msg.util.reply('alright, crashing the party.').then(() => playlist.stop());
}

module.exports = new Command('stop', exec, {
  aliases: ['stop', 'stfu'],
  userPermissions: 'MANAGE_GUILD',
  description: 'Stop playback and disconnect.'
});
