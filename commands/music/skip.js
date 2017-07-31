const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const { song } = playlist;
  if (!msg.member.permissions.has('MANAGE_CHANNELS') && song.member.id !== msg.member.id) {
    msg.util.error('you can\'t skip this song.');
  }

  playlist.skip();

  return msg.util.send({
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
        icon_url: msg.author.avatarURL // eslint-disable-line
      }
    }
  });
}

module.exports = new Command('skip', exec, {
  aliases: ['skip'],
  description: 'Skip the currently palying song.'
});
