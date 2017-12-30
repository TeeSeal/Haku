const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util')

class PlaylistCommand extends Command {
  constructor() {
    super('playlist', {
      aliases: ['playlist', 'playlists', 'queue', 'q'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'page',
          match: 'prefix',
          prefix: ['page=', 'p='],
          type: word => {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            if (num < 1) return null
            return num
          },
          default: 1,
        },
        {
          id: 'name',
          type: 'lowercase',
        },
      ],
      description: 'Shows the current playlist.',
    })
  }

  exec(msg, args) {
    const { page } = args
    const playlist = this.client.music.playlists.get(msg.guild.id)
    const [song, queue] = playlist
      ? [playlist.song, playlist.queue]
      : [null, null]

    if (!playlist) {
      return msg.util.error('nothing is currently playing.')
    }

    const list = queue.map(s => `• ${s.linkString}`)

    return msg.util.send(
      buildEmbed({
        title: 'Playlist:',
        description: `**Now playing:** ${song.linkString}`,
        paginate: {
          items: list,
          commandName: this.id,
          page,
        },
        icon: 'list',
        color: 'blue',
      })
    )
  }
}

module.exports = PlaylistCommand
