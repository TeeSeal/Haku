const ItemCollection = require('./ItemCollection.js');
const ItemHandler = require('./ItemHandler.js');

class Inventory extends ItemCollection {
  constructor(user) {
    const { inventory } = user.client.db.users.get(user.id);
    super(Object.entries(inventory)
      .map(([id, amount]) => [id, ItemHandler.resolveGroup(id, amount)])
    );

    for (const itemGroup of this.values()) itemGroup.bindTo(this);
    this.userID = user.id;
    this.db = user.client.db.users;
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
    return this.db.set(this.userID, { inventory: this.toJSON() });
  }
}

module.exports = Inventory;