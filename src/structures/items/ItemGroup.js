const fs = require('fs');
const pluralize = require('pluralize');
const { rootDir, capitalize } = require('../../util/all.js');

class ItemGroup {
  constructor(options) {
    this.inventory = null;

    this.id = options.id;
    this.value = options.value;
    this.shop = options.shop;
    this.description = options.description;
    this.emoji = options.emoji;
    this.rarity = options.rarity;
    this.url = options.url;
    this.type = options.type;

    if (this.type === 'item' && options.use) this.use = eval(options.use);
    this.setAmount(typeof options.amount === 'number' ? options.amount : 1);
  }

  toJSON() {
    const result = Object.assign({}, this);
    if (result.use) result.use = result.use.toString();
    return result;
  }

  setAmount(amount) {
    this.amount = amount;
    this.price = this.value * amount;
    this.name = this.emoji
      || pluralize(this.id, amount).split(' ').map(word => capitalize(word)).join(' ');
  }

  bindTo(inventory) {
    this.inventory = inventory;
    return this;
  }

  groupOf(amount) {
    const obj = Object.assign({}, this);
    obj.inventory = null;
    obj.amount = amount;
    return new types[this.type](obj);
  }

  add(amount) {
    if (!this.inventory) return;

    this.setAmount(this.amount + amount);

    if (this.type === 'currency' && (this.amount > 99 || this.amount < 1)) {
      this.inventory.convertCurrencies();
    } else if (this.amount < 1) {
      this.inventory.delete(this.id);
    }

    return this.inventory.save();
  }

  consume(amount) { this.add(-amount); }

  currencyPrice() {
    return ItemGroup.convertToCurrency(this.price);
  }

  priceString() {
    return this.currencyPrice().currencyString();
  }


  inspect() {
    return this.description;
  }

  create() {
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

  toString() { return this.name; }

  static convertToCurrency(amount) {
    const result = [];

    for (const currency of items.sortedCurrencies().reverse()) {
      const count = ~~(amount / currency.value);
      amount -= currency.value * count;
      result.unshift(currency.groupOf(count));
    }

    return new ItemCollection(result.filter(curr => curr.amount));
  }

  static resolve(string, count) {
    if (!string) return null;
    const { name, amount } = ItemGroup.findAmountAndName(string, count);

    const regexp = new RegExp(`^${pluralize(name.toLowerCase(), 1)}`, 'i');
    const item = items.find(i => regexp.test(i.id));
    if (!item) return null;

    const obj = Object.assign({}, item);
    obj.amount = amount;

    return new types[obj.type](obj);
  }

  static findAmountAndName(string, overwriteAmount) {
    const words = string.split(' ');
    let amount = words.find(word => /(^-?\d+$)|(^an?$)/.test(word));

    if (typeof overwriteAmount === 'number') {
      amount = overwriteAmount;
    } else if (amount) {
      words.splice(words.indexOf(amount), 1);
      amount = parseInt(amount) || 1;
    } else { amount = 1; }

    return { name: words.join(' '), amount };
  }


  static baseCurrency() { return new types[baseCurrency.type](baseCurrency); }
  static all(filter) { return items.filter(filter); }
  static get SHOP() { return items.filter(item => item.shop); }
}

module.exports = ItemGroup;

const types = {
  item: ItemGroup,
  recipe: require('./Recipe.js'),
  currency: require('./Currency.js')
};

const ItemCollection = require('./ItemCollection.js');
const items = new ItemCollection(require(`${rootDir}/assets/items.json`).map(item => {
  return new types[item.type](item);
}));

function writeItems() {
  return fs.writeFileSync(`${rootDir}/assets/items.json`, JSON.stringify(items.array().map(i => i.toJSON()), null, 2), 'utf8');
}

const baseCurrency = findBaseCurrency();
function findBaseCurrency() {
  const currencies = Array.from(items.filter(item => item.type === 'currency').values());
  const values = currencies.map(currency => currency.value);
  return currencies[values.indexOf(Math.min(...values))];
}
