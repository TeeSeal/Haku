const { Command } = require('discord-akairo');
const { Playlist } = require('../../structures/all.js');
const { buildEmbed, stripIndents, paginate } = require('../../util/all.js');

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  playlist.shuffle();
  const list = playlist.queue.map(s => `- ${s.linkString}`);
  const paginated = paginate(list);
  const leftOver = paginated[1]
    ? paginated.slice(1).reduce((a, b) => a + b.length, 0)
    : null;

  return msg.util.send(buildEmbed({
    title: 'SHUFFLED PLAYLIST:',
    content: stripIndents`
      **Now playing:** ${playlist.song.linkString}

      ${paginated.length === 0
        ? ''
        : `${paginated[0].join('\n')}${leftOver ? `\nand ${leftOver} more.` : ''}`
      }`,
    icon: 'list',
    color: 'blue'
  }));
}

module.exports = new Command('shuffle', exec, {
  aliases: ['shuffle'],
  description: 'Shuffle the current playlist.'
});
