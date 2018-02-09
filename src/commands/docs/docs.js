const { Command } = require('discord-akairo')
const Doc = require('../../structures/docs/Doc')

class TestCommand extends Command {
  constructor() {
    super('docs', {
      aliases: ['docs'],
      description: 'docs.',
      args: [
        {
          id: 'query',
          match: 'rest',
          type: 'lowercase',
        },
      ],
    })
  }

  async exec(msg, { query }) {
    const doc = await Doc.fetch('stable')
    const embed = doc.resolveEmbed(query)
    msg.channel.send(embed)
  }
}

module.exports = TestCommand
