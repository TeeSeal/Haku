const { Command } = require('discord-akairo');
const { buildEmbed, YouTube, stripIndents, paginate } = require('../../util/all.js');
const { Playlist, Song } = require('../../structures/all.js');

async function exec(msg, args) {
  const { query, load, rand, volume } = args;
  const guild = this.client.db.guilds.get(msg.guild.id);

  if (!msg.member.voiceChannel) return msg.util.error('you need to be in a voice channel.');

  const playlist = Playlist.get(msg.guild.id) || new Playlist(msg, guild);
  if (msg.guild.me.voiceChannel && msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const videos = load ? guild.playlists[query] : await YouTube.getVideos(query);
  if (!videos) return msg.util.error('there is no such playlist.');
  let songs = videos.map(video => new Song(video, msg.member, { volume }));
  if (rand) songs = shuffle(songs);

  const [added, removed] = playlist.add(songs);

  if (removed.length !== 0) {
    const rPaginated = paginate(removed);
    const rLeftOver = rPaginated.slice(1).reduce((a, b) => a + b.length, 0);

    await msg.util.send(buildEmbed({
      title: 'Failed to add:',
      content: stripIndents`
        ${rPaginated[0].map(obj => stripIndents`
          - ${obj.song.linkString}
          Reason: ${obj.reason}
        `).join('\n')}
        ${rPaginated[1] ? `and ${rLeftOver} more.` : ''}
      `,
      author: msg.member,
      icon: 'clear',
      color: 'red'
    }));
  }

  if (added.length === 0) return msg.util.error('nothing was added to the playlist.');

  const aPaginated = paginate(added);
  const aLeftOver = aPaginated.slice(1).reduce((a, b) => a + b.length, 0);

  return msg.util.send(buildEmbed({
    title: 'Added to playlist:',
    content: stripIndents`
      ${aPaginated[0].map(song => `- ${song.linkString}`).join('\n')}
      ${aPaginated[1] ? `and ${aLeftOver} more.` : ''}
    `,
    image: aPaginated[0].length === 1 ? aPaginated[0][0].thumbnail : null,
    author: msg.member,
    icon: 'playlistAdd',
    color: 'blue'
  }));
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
      type(word, msg) {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        const { maxVolume } = this.client.db.guilds.get(msg.guild.id);
        if (num < 1) return 1;
        if (num > maxVolume) return maxVolume;
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
