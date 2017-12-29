const Collection = require('../Collection')

class ItemCollection extends Collection {
  items() { return this.getType('item') }
  recipes() { return this.getType('recipe') }
  currencies() { return this.getType('currency') }

  exceptCurrencies() {
    return this.clone().filter(item => item.type !== 'currency')
  }

  sortedCurrencies() {
    return Array.from(this.currencies().values()).sort((c1, c2) => c2.value - c1.value)
  }

  get currencyString() {
    if (this.currencies().size === 0) return ''
    return this.sortedCurrencies()
      .map(curr => `**${curr.amount}**${curr.name}`)
      .join('  ')
  }

  get currencyValue() {
    return ItemCollection.getValue(this.currencies())
  }

  get totalValue() {
    return ItemCollection.getValue(this)
  }

  getType(type) {
    return this.clone().filter(itemGroup => itemGroup.type === type)
  }

  toString() {
    const items = Array.from(this.values())
    if (items.length === 0) return 'nothing'
    if (items.length === 1) return items[0].toString()
    const last = items.pop()
    return `${items.join(', ')} and ${last}`
  }

  clone() {
    return new ItemCollection(this)
  }

  toJSON() {
    const result = {}
    for (const item of this.values()) result[item.id] = item.amount
    return result
  }

  static getValue(coll) {
    return coll.reduce((amount, item) => amount + item.price, 0)
  }
}

module.exports = ItemCollection
