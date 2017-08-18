const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  return msg.util.reply('alright then...').then(() => playlist.stop());
}

module.exports = new Command('stop', exec, {
  aliases: ['stop', 'stfu'],
  description: 'Stop playback and disconnect.'
});
