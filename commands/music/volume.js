const { Command } = require('discord-akairo');
const { Playlist, db, stripIndents } = helpers;

async function exec(msg, args) {
  const { vol, def } = args;
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const { volume, song } = playlist;

  if (!vol) {
    return msg.util.send('\u200b', {
      files: [{ attachment: `assets/icons/volumeUp.png` }],
      embed: {
        title: song.title,
        url: song.url,
        color: 16763904,
        thumbnail: { url: `attachment://volumeUp.png` },
        fields: [
          {
            name: `Volume: ${playlist.volume}%`,
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

  if (def) {
    if (!msg.member.hasPermission('MANAGE_SERVER')) {
      return msg.util.error('you do not have permission to set the default volume.');
    }
    db.update('guilds', { id: msg.guild.id, defaultVolume: vol });
    return msg.util.success(`default volume updated to ${vol}%.`);
  }

  const name = vol < volume ? 'volumeDown.png' : 'volumeUp.png';

  playlist.setVolume(vol);
  return msg.util.send('\u200b', {
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
        icon_url: msg.member.user.avatarURL // eslint-disable-line
      }
    }
  });
}


module.exports = new Command('volume', exec, {
  aliases: ['volume', 'vol'],
  args: [
    {
      id: 'vol',
      type: 'integer'
    },
    {
      id: 'def',
      match: 'flag',
      prefix: '-default'
    }
  ],
  description: stripIndents`
    Change playback volume.
    Ranges from 1 to 100.
    Optional flags: \`-default\`

    **Usage:**
    \`volume 30\` => sets the volume to 30%.
    \`volume 50 -default\` => sets the default volume to 50%.
  `
});
