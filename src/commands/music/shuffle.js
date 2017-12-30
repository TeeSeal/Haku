const { Command } = require('discord-akairo')
const { buildEmbed, paginate } = require('../../util/Util')

class ShuffleCommand extends Command {
  constructor() {
    super('shuffle', {
      aliases: ['shuffle'],
      channelRestriction: 'guild',
      description: 'Shuffle the current playlist.',
    })
  }

  exec(msg) {
    const playlist = this.client.music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error(
        "you have to be in the voice channel I'm currently in."
      )
    }

    playlist.shuffle()
    const list = playlist.queue.map(s => `• ${s.linkString}`)
    const paginated = paginate(list)
    const leftOver = paginated[1]
      ? paginated.slice(1).reduce((a, b) => a + b.length, 0)
      : null

    const lines = [`**Now playing:** ${playlist.song.linkString}`, ''].concat(
      paginated[0].join('\n')
    )
    if (leftOver) lines.push(`and ${leftOver} more.`)

    return msg.util.send(
      buildEmbed({
        title: 'SHUFFLED PLAYLIST:',
        description: lines.join('\n'),
        icon: 'list',
        color: 'blue',
      })
    )
  }
}

module.exports = ShuffleCommand
