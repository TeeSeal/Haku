const { Command } = require('discord-akairo');
const { db, stripIndents } = _util;
const { Playlist } = _struct;

async function exec(msg, args) {
  const { vol } = args;
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const { volume, song } = playlist;

  if (!vol) {
    return msg.util.send({
      files: [{ attachment: `assets/icons/volumeUp.png` }],
      embed: {
        title: song.title,
        url: song.url,
        color: 16763904,
        thumbnail: { url: `attachment://volumeUp.png` },
        fields: [
          {
            name: `Volume: ${volume}%`,
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

  const name = vol < volume ? 'volumeDown.png' : 'volumeUp.png';

  playlist.setVolume(vol);
  return msg.util.send({
    files: [{ attachment: `assets/icons/${name}` }],
    embed: {
      title: song.title,
      url: song.url,
      color: 16763904,
      thumbnail: { url: `attachment://${name}` },
      fields: [
        {
          name: `Volume: ${vol}%`,
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


module.exports = new Command('volume', exec, {
  aliases: ['volume', 'vol'],
  args: [
    {
      id: 'vol',
      type: async (word, msg) => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        const max = await db.get('guilds', msg.guild, 'maxVolume');
        if (num < 1) return 1;
        if (num > max) return max;
        return num;
      }
    }
  ],
  description: stripIndents`
    Change playback volume.
    Ranges from 1 to 100.

    **Usage:**
    \`volume 30\` => sets the volume to 30%.
  `
});
