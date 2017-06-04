const { Command } = require('discord-akairo');
const { Playlist, Song, youtube, db, stripIndents, paginate } = helpers;

async function exec(msg, args) {
  const { query, load, rand } = args;
  const playlist = Playlist.get(msg.guild.id);
  const volume = await db.get('guilds', msg.guild, 'defaultVolume');

  if (!msg.member.voiceChannel) return msg.util.error('you need to be in a voice channel.');
  if (playlist && msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const videos = load ? await loadPlaylist(query, msg.guild) : await youtube.getVideos(query);
  if (!videos) return msg.util.error('there is no such playlist.');
  let songs = videos.map(video => new Song(video, msg.member));
  if (rand) songs = shuffle(songs);

  if (playlist) songs.forEach(song => playlist.add(song));
  else new Playlist({ msg, volume, songs }); // eslint-disable-line

  const paginated = paginate(songs);
  const leftOver = paginated.slice(1).reduce((a, b) => a + b.length, 0);

  return msg.util.send('\u200b', {
    files: [{ attachment: 'assets/icons/playlistAdd.png' }],
    embed: {
      title: 'Added to playlist:',
      description: stripIndents`
        ${paginated[0].map(song => `- ${song.linkString}`).join('\n')}
        ${paginated[1] ? `and ${leftOver} more.` : ''}
      `,
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

module.exports = new Command('play', exec, {
  aliases: ['play', 'yt'],
  args: [
    {
      id: 'load',
      match: 'flag',
      prefix: '-load'
    },
    {
      id: 'rand',
      match: 'flag',
      prefix: '-shuffle'
    },
    {
      id: 'query',
      match: 'rest'
    }
  ],
  description: stripIndents`
    Play some music.
    Optional flags: \`-load\`, \`-shuffle\`

    **Usage:**
    \`play something\` => searches youtube for 'something' and adds the first result to the queue
    \`play -load test\` => loads the saved playlist called 'test' and adds it to the queue
    \`play -load test -shuffle\` => shuffles the playlist before adding to queue
    Shuffle also works on youtube playlists.

    **The argument can be:**
    - Link to youtube video
    - Youtube video id
    - Link to youtube playlist
    - Name of saved playlist (with the -playlist flag)
    - Simple query to search youtube for
  `
});
