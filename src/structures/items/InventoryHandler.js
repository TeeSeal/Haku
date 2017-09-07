const Inventory = require('./Inventory.js');

class InventoryHandler {
  constructor(database) {
    this.db = database;
    this.inventories = new Map();
  }

  async fetch(id) {
    if (this.inventories.has(id)) return this.inventories.get(id);

    const inventory = await this.db.fetch(id, 'inventory');
    const instance = new Inventory(inventory, id, this);

    this.inventories.set(id, instance);
    setTimeout(() => this.inventories.delete(id), 6e5);

    return instance;
  }

  save(inventory) {
    return this.db.set(inventory.id, 'inventory', inventory.toJSON());
  }
}

module.exports = InventoryHandler;
