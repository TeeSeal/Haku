const fs = require('fs');
const pluralize = require('pluralize');
const Collection = require('./Collection.js');
const { rootDir, capitalize } = require('../util/all.js');

class Item {
  constructor(options) {
    Object.assign(this, options);
    if (!this.func) this.func = this.use.toString();
  }

  get imagePath() {
    if (this.url) return this.url;
    if (fs.existsSync(`${rootDir}/src/assets/items/${this.id}.png`)) return `${rootDir}/src/assets/items/${this.id}.png`;
    return null;
  }

  format(amount) {
    amount = Math.abs(amount);
    return pluralize(this.id, amount);
  }

  groupOf(amount) {
    const obj = Object.assign({}, this);
    obj.amount = amount;
    obj.name = capitalize(this.format(amount));
    obj.price = this.worth * amount;
    return new Item(obj);
  }

  add() {
    if (items.has(this.id)) return;
    items.set(this.id, this);
    return writeItems();
  }

  update() {
    if (!items.has(this.id)) return;
    items.set(this.id, this);
    return writeItems();
  }

  destroy() {
    if (!items.has(this.id)) return;
    items.delete(this.id);
    return writeItems();
  }

  toString() { return this.id; }

  static get GEM() { return items.get('gem'); }
  static get SHOP() { return items.filter(item => item.shop); }
  static all(filter) { return items.filter(filter); }

  static resolve(id) {
    if (!id) return;
    const formatted = pluralize(id.toLowerCase(), 1);
    const regexp = new RegExp(`^${formatted}`, 'i');
    const obj = items.find(item => regexp.test(item.id));
    if (!obj) return;
    return new Item(obj);
  }

  static resolveGroup(string) {
    const words = string.split(' ');
    let amount = words.find(word => /^-?\d+$/.test(word));
    if (amount) {
      words.splice(words.indexOf(amount), 1);
      amount = parseInt(amount);
    } else { amount = 1; }

    const item = Item.resolve(words.join(' '));
    return item ? item.groupOf(amount) : null;
  }
}

function writeItems() {
  return fs.writeFileSync(`${rootDir}/assets/items.json`, JSON.stringify(items.array(), null, 2), 'utf8');
}

const items = new Collection(require(`${rootDir}/assets/items.json`).map(item => {
  item.use = eval(item.func);
  return [item.id, new Item(item)];
}));

module.exports = Item;
