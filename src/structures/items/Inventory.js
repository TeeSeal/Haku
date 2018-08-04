const ItemCollection = require('./ItemCollection')
const ItemHandler = require('./')

class Inventory extends ItemCollection {
  constructor (inventory, id, handler) {
    super(
      Object.entries(inventory)
        .map(([name, amount]) => ItemHandler.resolveGroup(name, amount))
        .filter(item => item)
        .map(item => [item.id, item])
    )

    this.id = id
    this.handler = handler
    for (const item of this.values()) item.bindTo(this)
  }

  includes (items) {
    const hasItems = items
      .exceptCurrencies()
      .every(
        item => this.has(item.id) && this.get(item.id).amount >= item.amount
      )
    const hasCurrency = this.currencyValue >= items.currencyValue

    if (hasItems && hasCurrency) return true
    return false
  }

  add (items, amount) {
    if (items instanceof ItemCollection) {
      for (const item of items.values()) this.addItemGroup(item)
      return this
    } else if (!items.amount) {
      items = ItemHandler.resolveGroup(items, amount)
    }

    this.addItemGroup(items)
    return this
  }

  addItemGroup (item) {
    if (!this.has(item.id)) {
      this.set(item.id, item.groupOf(0).bindTo(this))
    }

    this.get(item.id).add(item.amount)
  }

  consume (items, amount) {
    if (!(items instanceof ItemCollection)) {
      return this.add(items, -amount || -1)
    }
    for (const item of items.values()) {
      if (this.has(item.id)) this.get(item.id).consume(item.amount)
    }
  }

  setBalance (amount) {
    const currencies = ItemHandler.convertToCurrency(amount)
    for (const key of this.currencies().keys()) this.delete(key)
    for (const currency of currencies.values()) {
      if (currency.amount > 0) this.set(currency.id, currency.bindTo(this))
    }
    this.save()
  }

  convertCurrencies () {
    this.setBalance(this.currencyValue)
  }

  save () {
    return this.handler.save(this)
  }
}

module.exports = Inventory
