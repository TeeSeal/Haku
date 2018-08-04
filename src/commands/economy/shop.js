const { Command } = require('discord-akairo')
const { parserInRange } = require('../../util')
const Embed = require('../../structures/HakuEmbed')
const Items = require('../../structures/items/')

class ShopCommand extends Command {
  constructor () {
    super('shop', {
      aliases: ['shop'],
      description: 'View the shop.',
      split: 'sticky',
      args: [
        {
          id: 'items',
          match: 'rest',
          type: Items.resolveCollection
        },
        {
          id: 'page',
          match: 'prefix',
          prefix: ['page=', 'p='],
          type: parserInRange(0),
          default: 0
        }
      ]
    })
  }

  exec (msg, args) {
    let { items, page } = args

    const shop = Items.SHOP
    if (shop.size === 0) {
      return msg.util.error("sorry, there's nothing in the shop yet.")
    }

    if (items) {
      items = items.filter(item => shop.has(item.id))
      if (items.size > 0) {
        return msg.util.send(
          items
            .map(item => {
              return `**${item.name}** | ${
                Items.convertToCurrency(item.price).currencyString
              }`
            })
            .join('\n')
        )
      }
    }

    const fields = shop.map(item => {
      return [
        item.name,
        Items.convertToCurrency(item.price).currencyString,
        true
      ]
    })

    return new Embed(msg.channel)
      .setTitle('**SHOP**')
      .setFields(fields)
      .setIcon(Embed.icons.SHOP)
      .setColor(Embed.colors.GOLD)
      .setPage(page)
      .send()
  }
}

module.exports = ShopCommand
