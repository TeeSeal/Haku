const { Listener } = require('discord-akairo')
const Items = require('../structures/items/ItemHandler.js')

const cooldowns = new Set()

async function exec(msg) {
  if (!cooldowns.has(msg.author.id) && !msg.author.bot) {
    const inventory = await this.client.inventories.fetch(msg.author.id)
    inventory.add(Items.baseCurrency().groupOf(Math.floor((Math.random() * (5 - 10)) + 10)))
    cooldowns.add(msg.author.id)
    setTimeout(() => cooldowns.delete(msg.author.id), 6e4)
  }
}

module.exports = new Listener('message', exec, {
  emitter: 'client',
  event: 'message',
})
