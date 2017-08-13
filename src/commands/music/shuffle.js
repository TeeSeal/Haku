const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');
const { buildEmbed } = require('../../util/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  playlist.shuffle();
  const list = playlist.queue.map(s => `- ${s.linkString}`).join('\n');

  return msg.util.send(buildEmbed({
    title: 'Shuffled playlist:',
    content: `**Now playing:** ${playlist.song.linkString}\n\n${list}`,
    icon: 'list',
    color: 'blue'
  }));
}

module.exports = new Command('shuffle', exec, {
  aliases: ['shuffle'],
  description: 'Shuffle the current playlist.'
});
