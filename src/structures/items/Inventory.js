const ItemGroup = require('./ItemGroup.js');
const ItemCollection = require('./ItemCollection.js');

class Inventory extends ItemCollection {
  constructor(user) {
    const { inventory } = user.client.db.users.get(user.id);
    super(Object.keys(inventory)
      .map(key => ItemGroup.resolve(key, inventory[key]))
    );

    for (const itemGroup of this.values()) itemGroup.bindTo(this);
    this.userID = user.id;
    this.db = user.client.db.users;
  }

  toJSON() {
    const result = {};
    for (const itemGroup of this.values()) result[itemGroup.id] = itemGroup.amount;
    return result;
  }

  add(item, amount) {
    if (!(item instanceof ItemGroup)) item = ItemGroup.resolve(item, amount);
    if (this.has(item.id)) {
      return this.get(item.id).add(item.amount);
    }

    this.set(item.id, item.bindTo(this));
    if (item.type === 'currency' && item.amount > 99) this.convertCurrencies();
    this.save();

    return this;
  }

  setBalance(amount) {
    const currencies = ItemGroup.convertToCurrency(amount);
    for (const currency of currencies.values()) this.set(currency.id, currency.bindTo(this));
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
