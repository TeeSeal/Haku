const { Command } = require('discord-akairo')
const Embed = require('../../structures/HakuEmbed')
const { Guild } = require('../../db')

class GuildInfoCommand extends Command {
  constructor () {
    super('guild', {
      aliases: ['guild', 'guild-info', 'server', 'server-info'],
      description: 'Get information about the current server.',
      channelRestriction: 'guild'
    })
  }

  exec (msg) {
    const config = Guild.get(msg.guild.id)
    const configs = [
      `Maximum amount of songs in playlist: **${config.songLimit}**`,
      `Maximum duration of a song: **${config.maxSongDuration}**`,
      `Default volume: **${config.defaultVolume}**`,
      `Maximum volume: **${config.maxVolume}**`
    ]

    const roles = msg.guild.roles.sort((a, b) => b.comparePositionTo(a))
    return new Embed(msg.channel)
      .setTitle(msg.guild.name)
      .setFields([
        ['Owner', msg.guild.owner.toString(), true],
        ['Member Count', msg.guild.memberCount, true],
        ['Roles', roles.array().join(', ')],
        ['Configuration', configs.join('\n')]
      ])
      .setColor(Embed.colors.CYAN)
      .setThumbnail(msg.guild.iconURL())
      .setAuthor(msg.member)
      .send()
  }
}

module.exports = GuildInfoCommand
