const { Command } = require('discord-akairo');
const { stripIndents } = require('../../util/all.js');

function exec(msg, args) {
  const { a, flag, prefix } = args;
  return msg.channel.send(stripIndents`
    \`\`\`json
    a = ${a},
    flag = ${flag},
    prefix = ${prefix}
    \`\`\`
  `);
}

module.exports = new Command('test', exec, {
  aliases: ['test'],
  ownerOnly: true,
  description: 'test.',
  split: 'sticky',
  args: [
    { id: 'a' },
    {
      id: 'flag',
      match: 'flag',
      prefix: '-flag'
    },
    {
      id: 'prefix',
      match: 'prefix',
      prefix: 'prefix='
    }
  ]
});
