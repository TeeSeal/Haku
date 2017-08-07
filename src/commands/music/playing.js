const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  const { song } = playlist;

  return msg.util.send({
    files: [{ attachment: 'src/assets/icons/time.png' }],
    embed: {
      title: song.title,
      url: song.url,
      color: 12517631,
      thumbnail: { url: 'attachment://time.png' },
      image: { url: song.thumbnail },
      fields: [
        {
          name: song.time,
          value: `Volume: ${playlist.volume}%`
        }
      ],
      author: {
        name: song.member.displayName,
        icon_url: song.member.user.avatarURL // eslint-disable-line
      }
    }
  });
}

module.exports = new Command('playing', exec, {
  aliases: ['playing', 'nowplaying', 'np', 'time'],
  description: 'Show details on the currently palying song.'
});
