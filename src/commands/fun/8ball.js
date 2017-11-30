const { Command } = require('discord-akairo')
const { randomFrom } = require('../../util/Util.js')

class EightBallCommand extends Command {
  constructor() {
    super('8ball', {
      aliases: ['8ball', '8b'],
      args: [
        {
          id: 'text',
          match: 'rest',
        },
        {
          id: 'add',
          match: 'flag',
          prefix: '-add',
        },
        {
          id: 'del',
          match: 'flag',
          prefix: '-del',
        },
      ],
      description: 'Ask the Magic 8Ball a question.',
    })
  }

  exec(msg, args) {
    const { text, add, del } = args
    const responses = this.client.db.guilds.get(msg.guild.id).eightBall.slice()

    if (del) {
      if (!text) return msg.util.error('what response are you trying to remove?')
      if (!responses.includes(text)) return msg.util.error('couldn\'t find such a response.')
      responses.splice(responses.indexOf(text), 1)
      return this.client.db.guilds.set(msg.guild.id, 'eightBall', responses)
        .then(() => msg.util.success('response deleted.'))
    }

    if (add) {
      if (!text) return msg.util.error('what response are you trying to add?')
      responses.push(text)
      return this.client.db.guilds.set(msg.guild.id, 'eightBall', responses)
        .then(() => msg.util.success('new response added.'))
    }

    if (!text) return msg.util.error('gotta ask something.')

    return msg.util.info(randomFrom(responses))
  }
}

module.exports = EightBallCommand
