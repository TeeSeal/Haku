const Collection = require('../Collection.js');
const ItemGroup = require('./ItemGroup.js');

class ItemCollection extends Collection {
  constructor(itemGroups) {
    super(itemGroups.filter(i => i).map(itemGroup => [itemGroup.id, itemGroup]));
  }

  clone() {
    return new ItemCollection(Array.from(this.values()));
  }

  items() {
    return this.clone().filter(itemGroup => itemGroup.type === 'item');
  }

  recipes() {
    return this.clone().filter(itemGroup => itemGroup.type === 'recipe');
  }

  currencies() {
    return this.clone().filter(itemGroup => itemGroup.type === 'currency');
  }

  sortedCurrencies() {
    return Array.from(this.currencies().values()).sort((c1, c2) => c1.value - c2.value);
  }

  currencyValue() {
    return this.currencies().reduce((amount, currency) => amount + currency.price, 0);
  }

  currencyString() {
    if (this.currencies().size === 0) return '';
    return this.sortedCurrencies()
      .map(curr => `**${curr.amount}** ${curr.name}`)
      .join(' | ');
  }

  static resolve(string) {
    if (!string) return null;
    return new ItemCollection(string.split(/[+,]|and/).map(word => ItemGroup.resolve(word.trim())));
  }
}

module.exports = ItemCollection;
