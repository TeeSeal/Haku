const ItemCollection = require('./ItemCollection.js');
const ItemHandler = require('./ItemHandler.js');

const inventories = new Map();

class Inventory extends ItemCollection {
  constructor(inventory, user) {
    super(Object.entries(inventory)
      .map(([id, amount]) => ItemHandler.resolveGroup(id, amount))
      .filter(item => item)
      .map(item => [item.id, item])
    );

    this.id = user.id;
    this.db = user.client.db.users;

    for (const item of this.values()) item.bindTo(this);

    inventories.set(this.id, this);
    setTimeout(() => {
      this.save();
      inventories.delete(this.id);
    }, 6e5);
  }

  add(items, amount) {
    if (items instanceof ItemCollection) {
      for (const item of items.values()) this.addItemGroup(item);
      return this;
    } else if (!items.amount) {
      items = ItemHandler.resolveGroup(items, amount);
    }

    this.addItemGroup(items);
    return this;
  }

  addItemGroup(item) {
    if (!this.has(item.id)) {
      this.set(item.id, item.groupOf(0).bindTo(this));
    }

    this.get(item.id).add(item.amount);
  }

  consume(items, amount) {
    if (!(items instanceof ItemCollection)) return this.add(items, -amount || -1);
    for (const item of items.values()) {
      if (this.has(item.id)) this.get(item.id).consume(item.amount);
    }
  }

  setBalance(amount) {
    const currencies = ItemHandler.convertToCurrency(amount);
    for (const key of this.currencies().keys()) this.delete(key);
    for (const currency of currencies.values()) {
      if (currency.amount > 0) this.set(currency.id, currency.bindTo(this));
    }
    this.save();
  }

  convertCurrencies() {
    this.setBalance(this.currencyValue());
  }

  save() {
    return this.db.set(this.id, 'inventory', this.toJSON());
  }

  static async fetch(user) {
    if (inventories.has(user.id)) return inventories.get(user.id);
    const inventory = await user.client.db.users.fetch(user.id, 'inventory');
    return new Inventory(inventory, user);
  }
}

module.exports = Inventory;
