const { Command } = require('discord-akairo')
const Embed = require('../../structures/HakuEmbed')
const Items = require('../../structures/items/')

class ShopCommand extends Command {
  constructor() {
    super('shop', {
      aliases: ['shop'],
      description: 'View the shop.',
      split: 'sticky',
      args: [
        {
          id: 'items',
          match: 'rest',
          type: Items.resolveCollection,
        },
        {
          id: 'page',
          match: 'prefix',
          prefix: ['page=', 'p='],
          type: word => {
            if (!word || isNaN(word)) return null
            const num = parseInt(word)
            if (num < 1) return null
            return num
          },
          default: 0,
        },
      ],
    })
  }

  exec(msg, args) {
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
        true,
      ]
    })

    return new Embed(msg.channel, {
      pagination: { items: fields, page },
    })
      .setTitle('**SHOP**')
      .setIcon(Embed.icons.SHOP)
      .setColor(Embed.colors.GOLD)
      .send()
  }
}

module.exports = ShopCommand
