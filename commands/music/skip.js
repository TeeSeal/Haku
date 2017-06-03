const { Command } = require('discord-akairo');
const { Playlist } = helpers;

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const { song } = playlist;
  song.dispatcher.end('skipped');

  return msg.util.send('\u200b', {
    files: [{ attachment: 'assets/icons/skip.png' }],
    embed: {
      title: song.title,
      url: song.url,
      color: 6750207,
      thumbnail: { url: 'attachment://skip.png' },
      fields: [
        {
          name: 'Skipped.',
          value: `\u200b`
        }
      ],
      author: {
        name: msg.member.displayName,
        icon_url: msg.member.user.avatarURL // eslint-disable-line
      }
    }
  });
}

module.exports = new Command('skip', exec, {
  aliases: ['skip'],
  description: 'Skip the currently palying song.'
});
