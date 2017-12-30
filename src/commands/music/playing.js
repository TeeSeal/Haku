const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util')

class PlayingCommand extends Command {
  constructor() {
    super('playing', {
      aliases: ['playing', 'nowplaying', 'np', 'time'],
      channelRestriction: 'guild',
      description: 'Show details on the currently palying song.',
    })
  }

  exec(msg) {
    const playlist = this.client.music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    const { song } = playlist

    return msg.util.send(
      buildEmbed({
        title: song.title,
        fields: [[song.time, `Volume: ${playlist.volume}%`]],
        url: song.url,
        author: msg.member,
        icon: 'time',
        color: 'purple',
      })
    )
  }
}

module.exports = PlayingCommand
