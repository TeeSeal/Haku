const { db } = _util;
const Item = require('./Item.js');
const Collection = require('./Collection.js');

class Inventory extends Collection {
  constructor(user, inventory) {
    super();

    for (const key of Object.keys(inventory)) {
      if (inventory[key] !== 0) {
        const item = Item.resolve(key);
        if (item) this.set(key, item.groupOf(inventory[key]));
      }
    }

    this._user = user;
  }

  get plain() {
    const result = {};
    for (const itemGroup of this.values()) result[itemGroup.id] = itemGroup.amount;
    return result;
  }

  get items() {
    return this.filter(itemGroup => itemGroup.id !== 'gem').array();
  }

  use(item, msg) {
    return item.use(msg, this);
  }

  resolve(names) {
    if (typeof names === 'string') names = [names];

    const result = names.map(name => {
      const item = Item.resolve(name);
      if (!item || !this.has(item.id)) return null;
      return this.get(item.id);
    });

    if (result.includes(null)) return null;
    return result[1] ? result : result[0];
  }

  update(item, amount) {
    if (!(item instanceof Item)) item = Item.resolve(item);
    if (!amount) amount = item.amount || 1;

    if (!this.has(item.id)) this.set(item.id, item.groupOf(0));

    const itemGroup = this.get(item.id);
    itemGroup.amount += amount;
    if (itemGroup.amount < 0) itemGroup.amount = 0;

    this.set(itemGroup.id, itemGroup);
    return this.save();
  }

  consume(item, amount) {
    if (!amount) amount = 1;
    return this.update(item, -amount);
  }

  save() {
    return db.update('users', {
      id: this._user.id,
      inventory: this.plain
    });
  }

  static async fetch(user) {
    return new Inventory(user, await db.get('users', user, 'inventory'));
  }
}

module.exports = Inventory;
