const { Command } = require('discord-akairo');
const { buildEmbed } = require('../../util/Util.js');
const { Playlist } = require('../../structures/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }
  if (playlist.paused) return msg.util.error('playback is already paused.');

  playlist.pause();
  const { song } = playlist;

  return msg.util.send(buildEmbed({
    title: song.title,
    fields: [
      ['Playback paused.', '\u200b']
    ],
    url: song.url,
    author: msg.member,
    icon: 'pause',
    color: 'yellow'
  }));
}

module.exports = new Command('pause', exec, {
  aliases: ['pause'],
  description: 'Pause sound playback'
});
