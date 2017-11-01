const { Command } = require('discord-akairo')
const { buildEmbed } = require('../../util/Util.js')

async function exec(msg) {
  const playlist = this.client.music.playlists.get(msg.guild.id)

  if (!playlist) return msg.util.error('nothing is currently playing.')
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.')
  }
  if (!playlist.paused) return msg.util.error('playback is not paused.')

  playlist.resume()
  const { song } = playlist

  return msg.util.send(buildEmbed({
    title: song.title,
    fields: [
      ['Playback resumed.', '\u200b'],
    ],
    url: song.url,
    author: msg.member,
    icon: 'play',
    color: 'green',
  }))
}

module.exports = new Command('resume', exec, {
  aliases: ['resume'],
  channelRestriction: 'guild',
  description: 'Resume paused playback.',
})
