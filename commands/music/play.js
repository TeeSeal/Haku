const { Command } = require('discord-akairo');
const { Playlist, Song, youtube, db } = helpers;

async function exec(msg, args) {
  const { query, load } = args;
  const playlist = Playlist.get(msg.guild.id);
  const volume = await db.get('guilds', msg.guild, 'defaultVolume');

  if (!msg.member.voiceChannel) return msg.util.error('you need to be in a voice channel.');
  if (playlist && msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const videos = load ? await loadPlaylist(query, msg.guild) : await getVideos(query);
  if (!videos) return msg.util.error('there is no such playlist.');
  const songs = videos.map(video => new Song(video, msg.member));

  if (playlist) songs.forEach(song => playlist.add(song));
  else new Playlist({ msg, volume, songs }); // eslint-disable-line

  return msg.util.send('\u200b', {
    files: [{ attachment: 'assets/icons/playlistAdd.png' }],
    embed: {
      title: 'Added to playlist:',
      description: songs.map(song => song.linkString).join('\n'),
      color: 6711039,
      thumbnail: { url: 'attachment://playlistAdd.png' },
      author: {
        name: msg.member.displayName,
        icon_url: msg.member.user.avatarURL // eslint-disable-line
      }
    }
  });
}

async function loadPlaylist(name, guild) {
  const playlists = await db.get('guilds', guild, 'playlists');
  if (!playlists[name]) return null;
  return playlists[name].list;
}

async function getVideos(query) {
  return youtube.getVideos(query);
}

module.exports = new Command('play', exec, {
  aliases: ['play', 'yt'],
  args: [
    {
      id: 'load',
      match: 'flag',
      prefix: '-playlist'
    },
    {
      id: 'query',
      match: 'rest'
    }
  ],
  description: stripIndents`
    Play some music.
    Optional flags: \`-playlist\`

    **Usage:**
    \`play something\` => searches youtube for 'something' and adds the first result to the queue
    \`play -playlist test\` => loads the saved playlist called 'test' and adds it to the queue
  `
});
