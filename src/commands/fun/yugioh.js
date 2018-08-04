const { Command } = require('discord-akairo')
const Embed = require('../../structures/HakuEmbed')
const YuGiOh = require('../../structures/api/yugioh/YuGiOh')

class YuGiOhCommand extends Command {
  constructor () {
    super('yugioh', {
      aliases: ['yugioh', 'ygo'],
      args: [
        {
          id: 'query',
          type: 'lowercase',
          match: 'rest'
        }
      ],
      description: 'Search for info on a Yu-Gi-Oh! card.'
    })
  }

  async exec (msg, args) {
    const { query } = args
    if (!query) return msg.util.error('please specify a name.')

    const card = await YuGiOh.findCard(query)
    if (!card) return msg.util.error("couldn't find card.")

    const fields = [
      ['Legality', `TCG: ${card.legality.tcg} | OCG: ${card.legality.ocg}`]
    ]

    if (card.materials) fields.unshift(['Materials', card.materials])
    if (card.linkMarkers) {
      fields.unshift(['Markers', card.linkMarkers.join(', ')])
    }
    if (card.defense) fields.unshift(['Defense', card.defense, true])
    if (card.attack) fields.unshift(['Attack', card.attack, true])

    return new Embed(msg.channel)
      .setTitle(card.name)
      .setURL(card.url)
      .setFields(fields)
      .setDescription(`${card.shortDescription}\n\n${card.description}`)
      .setThumbnail(card.image)
      .setColor(Embed.colors.ORANGE)
      .setAuthor(msg.member)
      .send()
  }
}

module.exports = YuGiOhCommand
