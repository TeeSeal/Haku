const { Command } = require('discord-akairo');
const Playlist = require('../../structures/music/Playlist.js');
const { stripIndents } = require('../../util/Util.js');

async function exec(msg, args) {
  const { maxSongDuration, defaultVolume, maxVolume, songLimit } = args;
  if (!Object.keys(args).some(key => args[key])) return msg.util.error('what are you trying to update?');
  const { guilds } = this.client.db;
  const dbDefaultVolume = guilds.get(msg.guild.id).defaultVolume;
  const dbMaxVolume = guilds.get(msg.guild.id).maxVolume;
  const playlist = Playlist.get(msg.guild.id);
  const obj = {};

  if (maxSongDuration) {
    if (playlist) playlist.maxSongDuration = maxSongDuration * 60;
    obj.maxSongDuration = maxSongDuration;
  }

  if (defaultVolume) {
    if (maxVolume || dbMaxVolume < defaultVolume) return msg.util.error('default volume can\'t be bigger than the maximum one.');
    if (playlist) playlist.defaultVolume = playlist.convert(defaultVolume);
    obj.defaultVolume = defaultVolume;
  }

  if (maxVolume) {
    if (defaultVolume || dbDefaultVolume > maxVolume) return msg.util.error('maximum volume can\'t be smaller than the default one.');
    if (defaultVolume && maxVolume < defaultVolume) { if (playlist && playlist.volume > maxVolume) playlist.setVolume(maxVolume); }
    obj.maxVolume = maxVolume;
  }

  if (songLimit) {
    if (playlist) playlist.songLimit = songLimit;
    obj.songLimit = songLimit;
  }

  const expression = getExpression(obj);
  guilds.set(msg.guild.id, obj);

  return msg.util.success(`updated ${expression}.`);
}

function getExpression(obj) {
  const arr = Object.keys(obj).map(key => `**${key}**(${obj[key]})`);
  if (arr.length === 1) return arr[0];
  const last = arr.pop();
  return `${arr.join(', ')} and ${last}`;
}

module.exports = new Command('set', exec, {
  aliases: ['default', 'def', 'set'],
  channelRestriction: 'guild',
  userPermissions: ['MANAGE_GUILD'],
  args: [
    {
      id: 'maxSongDuration',
      match: 'prefix',
      prefix: ['duration=', 'length='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return 1;
        if (num > 120) return 120;
        return num;
      }
    },
    {
      id: 'defaultVolume',
      match: 'prefix',
      prefix: ['volume=', 'vol='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return 1;
        if (num > 100) return 100;
        return num;
      }
    },
    {
      id: 'maxVolume',
      match: 'prefix',
      prefix: ['maxVolume=', 'maxVol=', 'mv='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return 1;
        if (num > 100) return 100;
        return num;
      }
    },
    {
      id: 'songLimit',
      match: 'prefix',
      prefix: ['songLimit=', 'songs=', 'maxSongs='],
      type: word => {
        if (!word || isNaN(word)) return null;
        const num = parseInt(word);
        if (num < 1) return 1;
        if (num > 100) return 100;
        return num;
      }
    }
  ],
  description: stripIndents`
    Set some default values for the guild.
    **Optional arguments:** (must have at least 1)
    \`duration\` - the maximum song duration for this guild (in minutes).
    \`volume\` - the default song volume for this guild (in %).
    \`maxVolume\` - the maximum song volume for this guild (in %).
    \`songLimit\` - the maximum amount of songs one can have in a playlist.

    **Usage:**
    \`default duration=20 volume=30 maxVolume=70\` => sets the values.
    \`default duration=20 v=30 mv=70\` => shortcuts.
  `
});
