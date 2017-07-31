const Item = require('./Item.js');
const Collection = require('./Collection.js');

class Inventory extends Collection {
  constructor(user) {
    super();
    this.userID = user.id;
    this.db = user.client.db.users;

    const { inventory } = this.db.get(user.id);
    for (const key in inventory) {
      if (inventory[key] !== 0) {
        const item = Item.resolve(key);
        if (item) this.set(key, item.groupOf(inventory[key]));
      }
    }
  }

  get plain() {
    const result = {};
    for (const itemGroup of this.values()) result[itemGroup.id] = itemGroup.amount;
    return result;
  }

  get items() {
    return this.filter(itemGroup => itemGroup.id !== 'gem').array();
  }

  get gems() {
    return this.get('gem');
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
    return this.db.set(this.userID, { inventory: this.plain });
  }
}

module.exports = Inventory;
