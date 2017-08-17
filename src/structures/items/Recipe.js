const ItemGroup = require('./ItemGroup.js');
const pluralize = require('pluralize');
const { filterObject, capitalize } = require('../../util/all.js');


class Recipe extends ItemGroup {
  constructor(options) {
    super(options);

    this.shop = options.shop;
    this.rarity = options.rarity;
    this.recipe = options.recipe;
    this.result = options.recipe.result;
    this.ingredients = this.recipe.ingredients;
  }

  toJSON() {
    return filterObject(this, ['id', 'value', 'shop', 'type', 'rarity', 'recipe']);
  }

  get name() {
    const suffix = pluralize('recipe', this.amount || 1);
    const resultName = this.id.split(' ').slice(1).map(word => capitalize(word)).join(' ');
    return `${resultName} ${suffix}`;
  }

  examine() {
    return Object.entries(this.ingredients)
      .map(([id, amount]) => `**${amount} ${id}**`).join(' | ')
      .concat(` => **${this.result.amount} ${this.result.id}**`);
  }

  craft() {
    return new Promise((resolve, reject) => {
      const hasItems = Object.entries(this.ingredients)
        .every(([id, amount]) => this.inventory.has(id) && this.inventory.get(id).amount >= amount);

      if (!hasItems) return reject('you have insufficient funds.');

      for (const [id, amount] of Object.entries(this.ingredients)) {
        this.inventory.get(id).consume(amount);
      }
      this.consume(1);

      this.inventory.add(this.result.id, this.result.amount);
      return resolve(this.result);
    });
  }
}

module.exports = Recipe;