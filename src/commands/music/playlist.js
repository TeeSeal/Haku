const { Command } = require('discord-akairo')
const Embed = require('../../structures/HakuEmbed')

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
          type: Embed.resolvePage,
          default: 0,
        },
        {
          id: 'name',
          type: 'lowercase',
        },
      ],
      description: 'Shows the current playlist.',
    })
  }

  exec(msg, { page }) {
    const playlist = this.client.music.playlists.get(msg.guild.id)
    const [song, queue] = playlist
      ? [playlist.song, playlist.queue]
      : [null, null]

    if (!playlist) {
      return msg.util.error('nothing is currently playing.')
    }

    const items = [`**Now playing:** ${song.linkString}`].concat(
      queue.map(s => `• ${s.linkString}`)
    )

    return new Embed(msg.channel, {
      pagination: { items, page },
    })
      .setTitle('Playlist:')
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .send()
  }
}

module.exports = PlaylistCommand
