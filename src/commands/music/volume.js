const { Command } = require('discord-akairo')
const { stripIndents } = require('../../util/Util')
const Embed = require('../../structures/HakuEmbed')

class VolumeCommand extends Command {
  constructor() {
    super('volume', {
      aliases: ['volume', 'vol'],
      channelRestriction: 'guild',
      args: [
        {
          id: 'newVolume',
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
        Change playback volume.
        Ranges from 1 to 100.

        **Usage:**
        \`volume 30\` => sets the volume to 30%.
      `,
    })
  }

  exec(msg, args) {
    const { newVolume } = args
    const playlist = this.client.music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error(
        "you have to be in the voice channel I'm currently in."
      )
    }

    const { volume, song } = playlist

    if (!newVolume) {
      return msg.util.send(
        buildEmbed({
          title: song.title,
          fields: [[`Volume: ${volume}%`, '\u200b']],
          url: song.url,
          author: msg.member,
          icon: 'volumeUp',
          color: 'yellow',
        })
      )
    }

    const icon
      = newVolume < volume ? Embed.icons.VOLUME_UP : Embed.icons.VOLUME_DOWN

    playlist.fadeVolume(newVolume)

    return new Embed(msg.channel)
      .setTitle(song.title)
      .setURL(song.url)
      .setAuthor(msg.member)
      .addField(`Volume: ${newVolume}%`, '\u200b')
      .setIcon(icon)
      .setColor(Embed.colors.YELLOW)
      .send()
  }
}

module.exports = VolumeCommand
