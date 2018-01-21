const ItemGroup = require('./ItemGroup')
const { filterObject } = require('../../util')

class Item extends ItemGroup {
  constructor(opts) {
    super(opts)

    this.description = opts.description
    this.shop = opts.shop
    this.emoji = opts.emoji
    this.rarity = opts.rarity
    this.url = opts.url
  }

  toJSON() {
    return filterObject(
      this,
      ['id', 'value', 'shop', 'description', 'emoji', 'rarity', 'url', 'type'],
      true
    )
  }
}

module.exports = Item
