const ItemGroup = require('./ItemGroup.js');
const { filterObject } = require('../../util/all.js');

class Recipe extends ItemGroup {
  constructor(options) {
    super(options);
    this.recipe = options.recipe;
    this.ingredients = this.recipe.ingredients;
  }

  toJSON() {
    return filterObject(this, ['id', 'value', 'shop', 'type', 'rarity', 'recipe']);
  }

  setAmount(amount) {
    this.amount = amount;
    this.price = this.value * amount;

    const prefix = `recipe${Math.abs(amount) > 1 ? 's' : ''}`;
    const resultName = ItemGroup.formatName(this.id.split(' ').slice(1).join(' '), 1);
    this.name = `${prefix}: ${resultName}`;
  }

  examine() {
    const result = this.recipe.result;
    return Object.entries(this.ingredients)
      .map(([id, amount]) => `**${amount} ${ItemGroup.formatName(id, amount)}**`).join(' | ')
      .concat(` => **${result.amount} ${ItemGroup.formatName(result.id, result.amount)}**`);
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

      const result = ItemGroup.resolve(this.recipe.result.id).groupOf(this.recipe.result.amount || 1);
      this.inventory.add(result);
      return resolve(result);
    });
  }
}

module.exports = Recipe;
