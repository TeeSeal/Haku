const { Command } = require('discord-akairo')
const Embed = require('../../structures/HakuEmbed')

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
    const items = [`**Now playing:** ${playlist.song.linkString}`].concat(
      playlist.queue.map(s => `• ${s.linkString}`)
    )

    return new Embed(msg.channel, {
      pagination: { items, page },
    })
      .setTitle('Shuffled playlist:')
      .setIcon(Embed.icons.LIST)
      .setColor(Embed.colors.BLUE)
      .send()
  }
}

module.exports = ShuffleCommand
