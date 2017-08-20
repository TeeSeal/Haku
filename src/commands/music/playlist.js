const { Command } = require('discord-akairo');
const { buildEmbed, stripIndents, paginate } = require('../../util/Util.js');
const { Playlist } = require('../../structures/all.js');

function exec(msg, args) {
  const playlist = Playlist.get(msg.guild.id);
  let { page } = args;
  const [song, queue] = playlist ? [playlist.song, playlist.queue] : [null, null];

  if (!playlist) { return msg.util.error('nothing is currently playing.'); }

  const list = queue.map(s => `• ${s.linkString}`);
  const paginated = paginate(list);
  if (page > paginated.length) page = paginated.length;

  return msg.util.send(buildEmbed({
    title: 'Playlist:',
    content: stripIndents`
      **Now playing:** ${song.linkString}

      ${paginated.length === 0
        ? ''
        : `
            ${paginated[page - 1].join('\n')}

            **Page: ${page}/${paginated.length}**
            Use: \`playlist page=<integer>\` to view another page.
          `
      }`,
    icon: 'list',
    color: 'blue'
  }));
}

module.exports = new Command('playlist', exec, {
  aliases: ['playlist', 'playlists', 'queue', 'q'],
  channelRestriction: 'guild',
  args: [
    {
      id: 'page',
      match: 'prefix',
      prefix: ['page=', 'p='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return null;
        return num;
      },
      default: 1
    },
    {
      id: 'name',
      type: 'lowercase'
    }
  ],
  description: 'Shows the current playlist.'
});
