const pluralize = require('pluralize')
const fs = require('fs')
const { capitalize, rootDir } = require('../../util/Util')

class ItemGroup {
  constructor(opts) {
    this.id = opts.id
    this.value = opts.value
    this.type = opts.type

    this.setAmount(typeof opts.amount === 'number' ? opts.amount : 1)
  }

  setAmount(amount) {
    this.amount = amount
    this.price = this.value * amount
    return this
  }

  bindTo(inventory) {
    this.inventory = inventory
    return this
  }

  groupOf(amount) {
    return new this.constructor({ ...this.toJSON(), amount })
  }

  add(amount) {
    if (!this.inventory) return

    this.setAmount(this.amount + amount)

    if (this.type === 'currency' && (this.amount > 99 || this.amount < 1)) {
      this.inventory.convertCurrencies()
    } else if (this.amount < 1) {
      this.inventory.delete(this.id)
    }

    return this.inventory.save()
  }

  consume(amount) {
    this.add(-amount)
  }

  priceString() {
    return this.currencyPrice().currencyString
  }

  examine() {
    return this.description || 'Dunno what that is.'
  }

  get name() {
    const nameString = pluralize(this.id, Math.abs(this.amount) || 1)
      .split(' ')
      .map(word => capitalize(word))
      .join(' ')
    return `${nameString}${this.emoji ? ` ${this.emoji}` : ''}`
  }

  get imagePath() {
    if (this.url) return this.url
    if (fs.existsSync(`${rootDir}/assets/items/${this.id}.png`)) { return `${rootDir}/assets/items/${this.id}.png` }
    return null
  }

  toString() {
    return `**${this.amount || 1} ${this.name}**`
  }
}

module.exports = ItemGroup
