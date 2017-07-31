const { Command } = require('discord-akairo');
const { db, stripIndents, paginate } = require('../../util/all.js');
const { Playlist } = require('../../structures/all.js');

async function exec(msg, args) {
  const playlist = Playlist.get(msg.guild.id);
  const { save, del, all, name } = args;
  let { page } = args;
  const [song, queue] = playlist ? [playlist.song, playlist.queue] : [null, null];

  if (save ^ del ^ all) {
    const playlists = await db.get('guilds', msg.guild, 'playlists');

    if (all) {
      if (Object.keys(playlists).length === 0) {
        return msg.util.reply('there aren\'t any playlists yet, why don\'t you create one?');
      }
      const list = Object.keys(playlists).map(key => {
        return `**${key}** | by ${msg.guild.members.get(playlists[key].author).displayName}`;
      });

      const paginated = paginate(list);
      if (page < 1 || !page) page = 1;
      if (page > paginated.length) page = paginated.length;

      return msg.util.send({
        files: [{ attachment: 'assets/icons/list.png' }],
        embed: {
          title: 'Available playlists:',
          description: stripIndents`
            ${paginated[page - 1].join('\n')}

            **Page: ${page}/${paginated.length}**
            Use: \`playlist -all page=<integer>\` to view another page.
          `,
          color: 6711039,
          thumbnail: { url: 'attachment://list.png' }
        }
      });
    }

    if (!name) return msg.util.error('you need to give a name for the playlist.');

    if (save) {
      if (!playlist) return msg.util.error('nothing is currently playing.');
      if (playlists[name]) return msg.util.error('a playlist with that name already exists.');
      playlists[name] = {
        author: msg.member.id,
        list: [song.plain].concat(queue.map(s => s.plain))
      };
    }

    if (del) {
      if (!playlists[name]) return msg.util.error('there is no such playlist.');
      if (playlists[name].author !== msg.author.id) return msg.util.error('you can only delete your own playlists.');
      playlists[name] = false;
    }

    db.update('guilds', { id: msg.guild.id, playlists });
    return msg.util.success(`playlists updated.`);
  }

  if (!playlist) { return msg.util.error('nothing is currently playing.'); }

  const list = queue.map(s => `- ${s.linkString}`);
  const paginated = paginate(list);
  if (page > paginated.length) page = paginated.length;


  return msg.util.send({
    files: [{ attachment: 'assets/icons/list.png' }],
    embed: {
      title: 'Playlist:',
      description: stripIndents`
        **Now playing:** ${song.linkString}

        ${paginated.length === 0
          ? ''
          : `
              ${paginated[page - 1].join('\n')}

              **Page: ${page}/${paginated.length}**
              Use: \`playlist page=<integer>\` to view another page.
            `
        }`,
      color: 6711039,
      thumbnail: { url: 'attachment://list.png' }
    }
  });
}

module.exports = new Command('playlist', exec, {
  aliases: ['playlist', 'playlists', 'queue', 'q'],
  args: [
    {
      id: 'save',
      match: 'flag',
      prefix: '-save'
    },
    {
      id: 'del',
      match: 'flag',
      prefix: '-delete'
    },
    {
      id: 'all',
      match: 'flag',
      prefix: '-all'
    },
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
  description: stripIndents`
    Shows the current playlist.
    **Optional flags:**
    \`-save\` - save the current playlist
    \`-delete\` - delete a saved playlist
    \`-all\` - view all available playlists

    **Usage:**
    \`playlist -save test\` => saves the current playlist under the name 'test'
    \`playlist -delelte test\` => deletes the playlist called 'test'.
    \`playlist -all\` => shows all available playlists.
  `
});
