const { Command } = require('discord-akairo')
const { buildEmbed, stripIndents, paginate, shuffle } = require('../../util/Util.js')

async function exec(msg, args) {
  const { queries, rand, volume } = args
  if (queries.length === 0) return msg.util.error('give me something to look for, yo..')
  if (!msg.member.voiceChannel) return msg.util.error('you need to be in a voice channel.')
  if (msg.guild.me.voiceChannel && msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.')
  }

  const guildOptions = this.client.db.guilds.get(msg.guild.id)
  const playlist = this.client.music.getPlaylist(msg, guildOptions)

  const songs = await this.client.music.resolveSongs(queries, { member: msg.member, volume })
  if (!songs) return msg.util.error('couldn\'t find resource.')
  if (rand) shuffle(songs)

  const [added, removed] = playlist.add(songs)

  if (removed.length !== 0) {
    const rPaginated = paginate(removed)
    const rLeftOver = rPaginated.slice(1).reduce((a, b) => a + b.length, 0)

    await msg.util.send(buildEmbed({
      title: 'Failed to add:',
      description: stripIndents`
        ${rPaginated[0].map(obj => stripIndents`
          • ${obj.song.linkString}
          Reason: ${obj.reason}
        `).join('\n')}
        ${rPaginated[1] ? `and ${rLeftOver} more.` : ''}
      `,
      author: msg.member,
      icon: 'clear',
      color: 'red',
    }))
  }

  if (added.length === 0) return msg.util.error('nothing was added to the playlist.')

  const aPaginated = paginate(added)
  const aLeftOver = aPaginated.slice(1).reduce((a, b) => a + b.length, 0)

  return msg.util.send(buildEmbed({
    title: 'Added to playlist:',
    description: stripIndents`
      ${aPaginated[0].map(song => `• ${song.linkString}`).join('\n')}
      ${aPaginated[1] ? `and ${aLeftOver} more.` : ''}
    `,
    image: aPaginated[0].length === 1 ? aPaginated[0][0].thumbnail : null,
    author: msg.member,
    icon: 'playlistAdd',
    color: 'blue',
  }))
}

module.exports = new Command('play', exec, {
  aliases: ['play', 'yt'],
  channelRestriction: 'guild',
  editable: false,
  typing: true,
  args: [
    {
      id: 'rand',
      match: 'flag',
      prefix: '-shuffle',
    },
    {
      id: 'queries',
      match: 'rest',
      type: line => line.split(';').map(q => q.trim()),
      default: [],
    },
    {
      id: 'volume',
      match: 'prefix',
      prefix: ['volume=', 'vol=', 'v='],
      type(word, msg) {
        if (!word || isNaN(word)) return null
        const num = parseInt(word)
        const { maxVolume } = this.client.db.guilds.get(msg.guild.id)
        if (num < 1) return 1
        if (num > maxVolume) return maxVolume
        return num
      },
    },
  ],
  description: stripIndents`
    Play some music.
    **Mandatory arguments:**
    \`query\` - something to use as a source.

    **Optional arguments:**
    \`volume\` - play the song(s) at the given volume rather than the default one.

    **Optional flags:**
    \`-shuffle\` - shuffle the songs before adding to playlist.

    **Usage:**
    \`play something\` => searches youtube for 'something' and adds the first result to the queue.
    \`play one two vol=35\` => searches youtube for 'one two' and adds the first result to the queue with the volume at 35%.

    **A query can be:**
    - Link to the YouTube/SoundCloud resource. (song or playlist)
    - Simple search query.

    **NOTE:**
    Search queries will default to YouTube.
    To specify a provider to search on use \`~<PROVIDER_NAME>\` anywhere in your query.
    Example: \`play otter pop ~soundcloud\` => will search for \`otter pop\` on soundcloud.

    You may also input multiple queries in a single command by separating them with \`;\`.
    Example: \`play <YOUTUBE_VIDEO>; <SOUNDCLOUD_PLAYLIST>; some search query; other search query ~soundcloud\`
  `,
})
