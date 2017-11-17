const { Command } = require('discord-akairo')
const { randomFrom } = require('../../util/Util.js')

const responses = [
  ['Yes.', 'Absolutely.', 'Most likely.', 'Without a doubt.', 'It is certain.'],
  ['Reply hazy, try again.', 'Better not tell you now.', 'Concentrate and ask again.'],
  ['My sources say no.', 'Nuh-huh.', 'Very doubtful.', 'Nah.', 'My sources say no.'],
]

function exec(msg, args) {
  const { question } = args
  if (!question) return msg.util.error('gotta ask something.')

  const section = randomFrom(responses)
  return msg.util.info(randomFrom(section))
}

module.exports = new Command('8ball', exec, {
  aliases: ['8ball', '8b'],
  args: [
    {
      id: 'question',
      match: 'rest',
    },
  ],
  description: 'Ask the Magic 8Ball a question.',
})
