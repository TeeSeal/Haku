const { Command } = require('discord-akairo')
const Items = require('../../structures/items/ItemHandler')

class BuyCommand extends Command {
  constructor() {
    super('buy', {
      aliases: ['buy'],
      description: 'Buy an item from the shop.',
      split: 'sticky',
      args: [
        {
          id: 'items',
          match: 'rest',
          type: Items.resolveCollection,
        },
      ],
    })
  }

  async exec(msg, args) {
    let { items } = args
    if (!items) return msg.util.error("dunno what you're trying to buy.")

    items = items.filter(item => Items.SHOP.has(item.id))
    if (items.size === 0) return msg.util.error('no such item(s) in the shop.')

    const inventory = await this.client.inventories.fetch(msg.author.id)
    const balance = inventory.currencyValue
    if (balance < items.totalValue) {
      return msg.util.error('you have insufficient funds to buy that.')
    }

    inventory.setBalance(balance - items.totalValue)
    inventory.add(items)

    return msg.util.success(`you have acquired ${items}`)
  }
}

module.exports = BuyCommand
