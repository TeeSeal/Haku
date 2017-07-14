const { Command } = require('discord-akairo');
const { Playlist } = _struct;

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }
  if (playlist.paused) return msg.util.error('playback is already paused.');

  playlist.pause();
  const { song } = playlist;

  return msg.util.send({
    files: [{ attachment: 'assets/icons/pause.png' }],
    embed: {
      title: song.title,
      url: song.url,
      color: 16763904,
      thumbnail: { url: 'attachment://pause.png' },
      fields: [
        {
          name: 'Playback paused.',
          value: '\u200b'
        }
      ],
      author: {
        name: msg.member.displayName,
        icon_url: msg.member.user.avatarURL // eslint-disable-line
      }
    }
  });
}

module.exports = new Command('pause', exec, {
  aliases: ['pause'],
  description: 'Pause sound playback'
});
