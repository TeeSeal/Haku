const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util.js')
const ReactionPoll = require('../../structures/ReactionPoll.js')

const voteSkips = new Set()

class SkipCommand extends Command {
  constructor() {
    super('skip', {
      aliases: ['skip'],
      channelRestriction: 'guild',
      description: 'Skip the currently palying song.',
    })
  }

  async exec(msg) {
    const playlist = this.client.music.playlists.get(msg.guild.id)

    if (!playlist) return msg.util.error('nothing is currently playing.')
    if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
      return msg.util.error('you have to be in the voice channel I\'m currently in.')
    }

    const { song } = playlist
    const opts = buildEmbed({
      title: song.title,
      fields: [
        ['✅ Skipped.', '\u200b'],
      ],
      url: song.url,
      author: msg.member,
      icon: 'skip',
      color: 'cyan',
    })

    if (msg.member.permissions.has('MANAGE_GUILD')
      || song.member.id === msg.member.id
      || msg.member.voiceChannel.members.size === 2) {
      return msg.util.send(opts).then(() => playlist.skip())
    }

    if (voteSkips.has(msg.guild.id)) {
      return msg.util.error('a voteskip is already in process.')
    }
    voteSkips.add(msg.guild.id)

    const members = msg.member.voiceChannel.members
      .filter(member => ![this.client.user.id, msg.author.id].includes(member.id))
    const votesNeeded = Math.ceil(members.size / 2)

    opts.embed.fields = [
      {
        name: 'VOTESKIP',
        value: `Click the ✅ to vote.\n${votesNeeded + 1} votes needed.\nVote will end in 30 seconds.`,
      },
    ]

    const statusMsg = await msg.util.send(members.array().join(), opts)
    const poll = new ReactionPoll(statusMsg, {
      emojis: ['✅'],
      users: members.map(m => m.id),
      time: 3e4,
    })

    poll.on('vote', () => {
      if (poll.votes.get('✅').length >= votesNeeded) poll.stop()
    })

    poll.once('end', votes => {
      const success = votes.get('✅').length >= votesNeeded
      voteSkips.delete(msg.guild.id)

      const { embed } = opts
      embed.fields = [
        {
          name: success ? '✅ Skipped.' : '❌ Voteskip failed.',
          value: '\u200b',
        },
      ]
      return statusMsg.edit(members.array().join(), { embed })
        .then(() => success ? playlist.skip() : null)
    })
  }
}

module.exports = SkipCommand
