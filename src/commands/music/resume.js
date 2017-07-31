const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }
  if (!playlist.paused) return msg.util.error('playback is not paused.');

  playlist.resume();
  const { song } = playlist;

  return msg.util.send({
    files: [{ attachment: 'src/assets/icons/play.png' }],
    embed: {
      title: song.title,
      url: song.url,
      color: 5025610,
      thumbnail: { url: 'attachment://play.png' },
      fields: [
        {
          name: 'Playback resumed.',
          value: '\u200b'
        }
      ],
      author: {
        name: msg.member.displayName,
        icon_url: msg.author.avatarURL // eslint-disable-line
      }
    }
  });
}

module.exports = new Command('resume', exec, {
  aliases: ['resume'],
  description: 'Resume paused playback.'
});
