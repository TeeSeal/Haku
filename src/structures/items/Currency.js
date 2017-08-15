const ItemGroup = require('./ItemGroup.js');

class Currency extends ItemGroup {
  toJSON() {
    const { id, value, type, emoji, description } = this;
    return { id, value, type, emoji, description };
  }

  use(item) {
    return new Promise((resolve, reject) => {
      if (!this.exchangeRates[item.id]) {
        return reject(`you cannot exchange **${this.id}** for **${item.id}**`);
      }

      this.inventory.consume(this);
      this.inventory.update(item.groupOf(this.amount * this.exchangeRates[item.id]));

      return resolve(this.inventory.get(item.id));
    });
  }
}

module.exports = Currency;
