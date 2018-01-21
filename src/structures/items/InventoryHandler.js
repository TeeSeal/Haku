const Inventory = require('./Inventory')
const { User } = require('../../db')

const inventories = new Map()

class InventoryHandler {
  static async fetch(id) {
    if (inventories.has(id)) return inventories.get(id)

    const inventory = await User.fetch(id, 'inventory')
    const instance = new Inventory(inventory, id, this)

    inventories.set(id, instance)
    setTimeout(() => inventories.delete(id), 6e5)

    return instance
  }

  static save(inventory) {
    return User.set(inventory.id, 'inventory', inventory.toJSON())
  }
}

module.exports = InventoryHandler
