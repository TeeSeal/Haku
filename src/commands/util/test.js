const { Command } = require('discord-akairo')
const HakuEmbed = require('../../structures/HakuEmbed')

class TestCommand extends Command {
  constructor() {
    super('test', {
      aliases: ['test'],
      ownerOnly: true,
      description: 'test.',
      split: 'sticky',
      args: [
        {
          id: 'a',
          type: 'commandCategory',
        },
        {
          id: 'flag',
          match: 'flag',
          prefix: '-flag',
        },
        {
          id: 'prefix',
          match: 'prefix',
          prefix: 'prefix=',
        },
      ],
    })
  }

  async exec(msg) {
    const m = await msg.channel.send('test')
    const reaction = await m.react('⬅')
    setTimeout(() => reaction.users.remove(), 1000)
  }
}

module.exports = TestCommand
