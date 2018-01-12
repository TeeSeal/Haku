const { Command } = require('discord-akairo')
const Embed = require('../../structures/HakuEmbed')

class ResumeCommand extends Command {
  constructor() {
    super('resume', {
      aliases: ['resume'],
      channelRestriction: 'guild',
      description: 'Resume paused playback.',
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
    if (!playlist.paused) return msg.util.error('playback is not paused.')

    playlist.resume()
    const { song } = playlist

    return new Embed(msg.channel)
      .setTitle(song.title)
      .setURL(song.url)
      .setAuthor(msg.member)
      .addField('Playback resumed.', '\u200b')
      .setIcon(Embed.icons.PLAY)
      .setColor(Embed.colors.GREEN)
      .send()
  }
}

module.exports = ResumeCommand
