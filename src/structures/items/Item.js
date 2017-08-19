const ItemGroup = require('./ItemGroup.js');
const { filterObject } = require('../../util/Util.js');

class Item extends ItemGroup {
  constructor(options) {
    super(options);

    this.description = options.description;
    this.shop = options.shop;
    this.emoji = options.emoji;
    this.rarity = options.rarity;
    this.url = options.url;
  }

  toJSON() {
    return filterObject(this, ['id', 'value', 'shop', 'description', 'emoji', 'rarity', 'url', 'type']);
  }
}

module.exports = Item;
