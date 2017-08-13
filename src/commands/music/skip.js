const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');
const { buildEmbed } = require('../../util/all.js');

function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const { song } = playlist;
  if (!msg.member.permissions.has('MANAGE_CHANNELS') && song.member.id !== msg.member.id) {
    msg.util.error('you can\'t skip this song.');
  }

  return msg.util.send(buildEmbed({
    title: song.title,
    fields: [
      ['Skipped.', '\u200b']
    ],
    url: song.url,
    author: msg.member,
    icon: 'skip',
    color: 'cyan'
  })).then(() => playlist.skip());
}

module.exports = new Command('skip', exec, {
  aliases: ['skip'],
  description: 'Skip the currently palying song.'
});
