const { Command } = require('discord-akairo');

function exec(msg, args) {
  const [from, to] = args.to === 0
    ? args.from === 0
      ? [0, 100]
      : [0, args.from]
    : [args.from, args.to];

  const number = Math.floor(Math.random() * (to - from)) + from;
  return msg.util.reply(`you rolled **${number}**`);
}

module.exports = new Command('roll', exec, {
  aliases: ['roll'],
  args: [
    {
      id: 'from',
      type: 'integer',
      default: 0
    },
    {
      id: 'to',
      type: 'integer',
      default: 0
    }
  ],
  description: stripIndents`
    Roll a random number.
    Optional arguments: \`from\`, \`to\`

    **Usage:**
    \`roll\` => random number between 1 and 100.
    \`roll 30\` => random number between 1 and 30.
    \`roll 30 100\` => random number between 30 and 100.
  `
});
