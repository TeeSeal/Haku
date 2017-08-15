const ItemGroup = require('./ItemGroup.js');

class Recipe extends ItemGroup {
  constructor(options) {
    super(options);
    this.recipe = options.recipe;
    this.ingredients = this.recipe.ingredients;
    this.result = ItemGroup.resolve(this.recipe.result.id).groupOf(this.recipe.result.amount || 1);
  }

  toJSON() {
    const { id, value, shop, type, rarity, recipe } = this;
    return { id, value, shop, type, rarity, recipe };
  }

  inspect() {
    return Object.keys(this.ingredients)
      .map(key => `${this.ingredients[key]} ${key}`).join(' | ')
      .concat(`${this.result.amount} ${this.result.name}`);
  }

  use() {
    return new Promise((resolve, reject) => {
      const hasItems = Object.keys(this.ingredients)
        .every(id => this.inventory.has(id) && this.inventory.get(id).amount >= this.ingredients[id]);

      if (!hasItems) return reject('you have insufficient funds.');

      for (const id in this.ingredients) {
        this.inventory.consume(id, this.ingredients[id]);
      }
      this.inventory.consume(this.groupOf(1));

      this.inventory.update(this.result);
      return resolve(this.inventory.get(this.result.id));
    });
  }
}

module.exports = Recipe;
