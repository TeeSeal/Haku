const { Command } = require('discord-akairo');
const { Playlist, ReactionPoll } = require('../../structures/all.js');
const { buildEmbed } = require('../../util/Util.js');

const voteSkips = new Set();

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');
  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  const { song } = playlist;
  if (msg.member.permissions.has('MANAGE_GUILD')
    || song.member.id === msg.member.id
    || msg.member.voiceChannel.members.size === 2) {
    return msg.util.send(buildEmbed({
      title: song.title,
      fields: [
        ['✅ Skipped.', '\u200b']
      ],
      url: song.url,
      author: msg.member,
      icon: 'skip',
      color: 'cyan'
    })).then(() => playlist.skip());
  }

  if (voteSkips.has(msg.guild.id)) {
    return msg.util.error('a voteskip is already in process.');
  }
  voteSkips.add(msg.guild.id);

  const members = msg.member.voiceChannel.members
    .filter(member => ![this.client.user.id, msg.author.id].includes(member.id));
  const votesNeeded = Math.ceil(members.size / 2);

  const options = buildEmbed({
    title: song.title,
    fields: [
      [
        'VOTESKIP',
        `Click the ✅ to vote.\n${votesNeeded + 1} votes needed.\nVote will end in 30 seconds.`
      ]
    ],
    url: song.url,
    author: msg.member,
    icon: 'skip',
    color: 'cyan'
  });

  const statusMsg = await msg.util.send(members.array().join(), options);
  const poll = new ReactionPoll(statusMsg, {
    emojis: ['✅'],
    users: members.map(m => m.id),
    time: 3e4
  });

  poll.on('vote', () => {
    if (poll.votes.get('✅').length >= votesNeeded) poll.stop();
  });

  poll.once('end', votes => {
    const success = votes.get('✅').length >= votesNeeded;
    voteSkips.delete(msg.guild.id);

    options.embed.fields = [
      {
        name: success ? '✅ Skipped.' : '❌ Voteskip failed.',
        value: '\u200b'
      }
    ];
    return statusMsg.edit(members.array().join(), options)
      .then(() => success ? playlist.skip() : null);
  });
}

module.exports = new Command('skip', exec, {
  aliases: ['skip'],
  description: 'Skip the currently palying song.'
});
