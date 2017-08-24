const { Command } = require('discord-akairo');
const exec = require('util').promisify(require('child_process').exec);

function run(msg, args) {
  const { command } = args;
  if (!command) return msg.util.error('give me something to run.');

  return exec(command).then(({ stdout, stderr }) => {
    return msg.util.send(stderr || stdout, { code: true });
  }).catch(err => {
    return msg.util.send(err, { code: true });
  });
}

module.exports = new Command('exec', run, {
  aliases: ['exec'],
  description: 'execute a command in the terminal.',
  args: [
    {
      id: 'command',
      match: 'rest'
    }
  ]
});
