const { Listener } = require('discord-akairo')
const Items = require('../structures/items/ItemHandler')

const cooldowns = new Set()

class MessageListener extends Listener {
  constructor() {
    super('message', {
      emitter: 'client',
      event: 'message',
    })
  }

  async exec(msg) {
    if (!cooldowns.has(msg.author.id) && !msg.author.bot) {
      const inventory = await this.client.inventories.fetch(msg.author.id)
      inventory.add(
        Items.baseCurrency().groupOf(Math.floor(Math.random() * (5 - 10) + 10))
      )
      cooldowns.add(msg.author.id)
      setTimeout(() => cooldowns.delete(msg.author.id), 6e4)
    }
  }
}

module.exports = MessageListener
