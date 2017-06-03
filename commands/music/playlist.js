const { Command } = require('discord-akairo');
const { Playlist, db } = helpers;

async function exec(msg, args) {
  const playlist = Playlist.get(msg.guild.id);
  const { save, del, all, name } = args;
  const [song, queue] = playlist ? [playlist.song, playlist.queue] : [null, null];

  if (save ^ del ^ all) {
    const playlists = await db.get('guilds', msg.guild, 'playlists');

    if (all) {
      const list = Object.keys(playlists).map(key => {
        return `**${key}** | by ${msg.guild.members.get(playlists[key].author).displayName}`;
      }).join('\n');

      return msg.util.send('\u200b', {
        files: [{ attachment: 'assets/icons/list.png' }],
        embed: {
          title: 'Available playlists:',
          description: list,
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
        list: [
          {
            id: song.id,
            title: song.title,
            duration: song.duration
          }
        ].concat(queue.map(s => {
          return {
            id: s.id,
            title: s.title,
            duration: s.duration
          };
        }))
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

  const list = queue.map(s => `- ${s.linkString}`).join('\n');
  return msg.util.send('\u200b', {
    files: [{ attachment: 'assets/icons/list.png' }],
    embed: {
      title: 'Playlist:',
      description: `**Now playing:** ${song.linkString}\n\n${list}`,
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
      id: 'name',
      type: 'lowercase'
    }
  ],
  description: stripIndents`
    Shows the current playlist.
    Optional flags: \`-save\`, \`-delete\`, \`-all\`

    **Usage:**
    \`playlist -save test\` => saves the current playlist under the name 'test'
    \`playlist -delelte test\` => deletes the playlist called 'test'.
    \`playlist -all\` => shows all available playlists.
  `
});
