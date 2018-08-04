const { Listener } = require('discord-akairo')
const Items = require('../structures/items')
const Inventory = require('../structures/items/InventoryHandler')

const cooldowns = new Set()

class MessageListener extends Listener {
  constructor () {
    super('message', {
      emitter: 'client',
      event: 'message'
    })
  }

  async exec (msg) {
    if (!cooldowns.has(msg.author.id) && !msg.author.bot) {
      const inventory = await Inventory.fetch(msg.author.id)
      inventory.add(
        // prettier-ignore
        Items.baseCurrency().groupOf(Math.floor((Math.random() * (5 - 10)) + 10))
      )
      cooldowns.add(msg.author.id)
      setTimeout(() => cooldowns.delete(msg.author.id), 6e4)
    }
  }
}

module.exports = MessageListener
