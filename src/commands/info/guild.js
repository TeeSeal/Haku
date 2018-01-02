const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util')

class GuildInfoCommand extends Command {
  constructor() {
    super('guild', {
      aliases: ['guild', 'guild-info', 'server', 'server-info'],
      description: 'Get information about the current server.',
      channelRestriction: 'guild',
    })
  }

  exec(msg) {
    const config = this.client.db.guilds.get(msg.guild.id)
    const configs = [
      `Maximum amount of songs in playlist: **${config.songLimit}**`,
      `Maximum duration of a song: **${config.maxSongDuration}**`,
      `Default volume: **${config.defaultVolume}**`,
      `Maximum volume: **${config.maxVolume}**`,
    ]

    const roles = msg.guild.roles.sort((a, b) => b.comparePositionTo(a))

    const embed = buildEmbed({
      title: `${msg.guild.name}`,
      fields: [
        ['Owner', msg.guild.owner.toString(), true],
        ['Member Count', msg.guild.memberCount, true],
        ['Roles', roles.array().join(', ')],
        ['Configuration', configs.join('\n')],
      ],
      color: 'cyan',
      thumbnail: msg.guild.iconURL(),
      author: msg.member,
    })

    return msg.channel.send(embed)
  }
}

module.exports = GuildInfoCommand
