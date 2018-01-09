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

  exec(msg) {
    const embed = new HakuEmbed(msg.channel, {
      pagination: {
        items: ['foo', 'bar', 'baz', 'toumorokoshi', 'matsubokkuri'],
        by: 2,
      },
    }).setTitle('TEST TEST')

    return embed.send()
  }
}

module.exports = TestCommand
