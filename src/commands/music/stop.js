const { Command } = require('discord-akairo');
const { Playlist, ReactionPoll } = require('../../structures/all.js');
const { buildEmbed } = require('../../util/Util.js');

const voteStops = new Set();

async function exec(msg) {
  const playlist = Playlist.get(msg.guild.id);

  if (!playlist) return msg.util.error('nothing is currently playing.');

  if (msg.member.permissions.has('MANAGE_GUILD')) {
    return msg.util.success('alright, crashing the party.').then(() => playlist.stop());
  }

  if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) {
    return msg.util.error('you have to be in the voice channel I\'m currently in.');
  }

  if (msg.member.voiceChannel.members.size === 2) {
    return msg.util.success('stopped playback.').then(() => playlist.stop());
  }

  if (voteStops.has(msg.guild.id)) {
    return msg.util.error('a voteskip is already in process.');
  }
  voteStops.add(msg.guild.id);

  const members = msg.member.voiceChannel.members
    .filter(member => ![this.client.user.id, msg.author.id].includes(member.id));
  const votesNeeded = Math.ceil(members.size / 2);

  const { song } = playlist;
  const options = buildEmbed({
    title: song.title,
    fields: [
      [
        'VOTESTOP',
        `Click the ✅ to vote.\n${votesNeeded + 1} votes needed.\nVote will end in 30 seconds.`
      ]
    ],
    url: song.url,
    author: msg.member,
    icon: 'clear',
    color: 'red'
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
    voteStops.delete(msg.guild.id);

    options.embed.fields = [
      {
        name: success ? '✅ Playback stopped.' : '❌ Votestop failed.',
        value: '\u200b'
      }
    ];

    return statusMsg.edit(members.array().join(), options)
      .then(() => success ? playlist.stop() : null);
  });
}

module.exports = new Command('stop', exec, {
  aliases: ['stop', 'stfu'],
  channelRestriction: 'guild',
  description: 'Stop playback and disconnect.'
});
