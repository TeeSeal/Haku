const { Command } = require('discord-akairo');
const { youtube, db, stripIndents, paginate } = require('../../util/all.js');
const { Playlist, Song } = require('../../structures/all.js');

async function exec(msg, args) {
  const { query, load, rand, volume } = args;
  const guild = await db.get('guilds', msg.guild);

  if (!msg.member.voiceChannel) return msg.util.error('you need to be in a voice channel.');

  const playlist = Playlist.get(msg.guild.id) || new Playlist(msg, guild);
  if (msg.guild.me.voiceChannel && msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const videos = load ? await loadPlaylist(query, msg.guild) : await youtube.getVideos(query);
  if (!videos) return msg.util.error('there is no such playlist.');
  let songs = videos.map(video => new Song(video, msg.member, { volume }));
  if (rand) songs = shuffle(songs);

  const [added, removed] = playlist.add(songs);

  if (removed.length !== 0) {
    const rPaginated = paginate(removed);
    const rLeftOver = rPaginated.slice(1).reduce((a, b) => a + b.length, 0);

    await msg.util.send({
      files: [{ attachment: 'assets/icons/clear.png' }],
      embed: {
        title: 'Failed to add:',
        description: stripIndents`
          ${rPaginated[0].map(obj => stripIndents`
            - ${obj.song.linkString}
            Reason: ${obj.reason}
          `).join('\n')}
          ${rPaginated[1] ? `and ${rLeftOver} more.` : ''}
        `,
        color: 16731469,
        thumbnail: { url: 'attachment://clear.png' },
        author: {
          name: msg.member.displayName,
          icon_url: msg.author.avatarURL // eslint-disable-line
        }
      }
    });
  }

  if (added.length === 0) return msg.util.error('nothing was added to the playlist.');

  const aPaginated = paginate(added);
  const aLeftOver = aPaginated.slice(1).reduce((a, b) => a + b.length, 0);

  return msg.util.send({
    files: [{ attachment: 'assets/icons/playlistAdd.png' }],
    embed: {
      title: 'Added to playlist:',
      description: stripIndents`
        ${aPaginated[0].map(song => `- ${song.linkString}`).join('\n')}
        ${aPaginated[1] ? `and ${aLeftOver} more.` : ''}
      `,
      color: 6711039,
      thumbnail: { url: 'attachment://playlistAdd.png' },
      author: {
        name: msg.member.displayName,
        icon_url: msg.author.avatarURL // eslint-disable-line
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
  editable: false,
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
      match: 'rest',
      type: line => {
        const url = line.split(' ').find(word => /^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(word));
        if (url) return url;
        return line;
      }
    },
    {
      id: 'volume',
      match: 'prefix',
      prefix: ['volume=', 'vol=', 'v='],
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
    Play some music.
    **Optional arguments:**
    \`volume\` - play the song(s) at the given volume rather than the default one.

    **Optional flags:**
    \`-load\` - load a saved playlist.
    \`-shuffle\` - shuffle the playlist before playing.

    **Usage:**
    \`play something\` => searches youtube for 'something' and adds the first result to the queue.
    \`play one two vol=35\` => searches youtube for 'one two' and adds the first result to the queue with the volume at 35%.
    \`play -load test\` => loads the saved playlist called 'test' and adds it to the queue.
    \`play -load test -shuffle\` => shuffles the playlist before adding to queue.
    Shuffle also works on youtube playlists.

    **The argument can be:**
    - Link to youtube video
    - Youtube video id
    - Link to youtube playlist
    - Youtube playlist id
    - Name of saved playlist (with the -playlist flag)
    - Simple query to search youtube for
  `
});
