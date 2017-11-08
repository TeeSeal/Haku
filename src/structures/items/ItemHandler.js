const fs = require('fs')
const pluralize = require('pluralize')
const Fuse = require('fuse.js')
const { rootDir, capitalize } = require('../../util/Util.js')
const ItemCollection = require('./ItemCollection.js')
const itemTypes = {
  item: require('./Item.js'),
  recipe: require('./Recipe.js'),
  currency: require('./Currency.js'),
}

const items = new ItemCollection(require(`${rootDir}/assets/items.json`).map(item => {
  return [item.id, new itemTypes[item.type](item)]
}))

const fuse = new Fuse(items.array(), {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['id'],
})

const baseCurrency = findBaseCurrency()

class ItemHandler {
  constructor() {
    throw new Error('this class may not be instantiated.')
  }

  static findAmountAndName(string, overwriteAmount) {
    const words = string.split(' ')
    let amount = [words[0], words[words.length - 1]].find(word => /(^-?\d+$)|(^an?$)/.test(word))
    if (amount) words.splice(words.indexOf(amount), 1)

    if (typeof overwriteAmount === 'number') {
      amount = overwriteAmount
    } else {
      amount = parseInt(amount) || 1
    }

    return { name: words.join(' ').toLowerCase(), amount }
  }

  static resolveGroup(string, count) {
    if (!string) return null
    let { name, amount } = ItemHandler.findAmountAndName(string, count)
    let recipe

    if (name.toLowerCase().includes('recipe')) {
      name = ItemHandler.formatRecipeName(name)
      recipe = true
    }

    const singular = pluralize(name, 1)
    const formatted = recipe ? `recipe: ${singular}` : singular
    const item = fuse.search(formatted)[0]
    if (!item) return null

    const obj = Object.assign({}, item)

    return new itemTypes[obj.type](obj).groupOf(amount)
  }

  static resolveCollection(string) {
    if (!string) return null
    const coll = new ItemCollection(string.split(/[+,]|and/)
      .map(word => ItemHandler.resolveGroup(word.trim()))
      .filter(item => item)
      .map(item => [item.id, item])
    )

    const currencies = ItemHandler.convertToCurrency(coll.currencyValue)

    for (const key of coll.currencies().keys()) coll.delete(key)
    for (const currency of currencies.values()) {
      if (currency.amount > 0) coll.set(currency.id, currency)
    }

    return coll
  }

  static convertToCurrency(amount) {
    const result = []

    for (const currency of items.sortedCurrencies()) {
      const count = ~~(amount / currency.value)
      amount -= currency.value * count
      result.push(currency.groupOf(count))
    }

    return new ItemCollection(result
      .filter(curr => curr.amount)
      .map(curr => [curr.id, curr])
    )
  }

  static formatName(name, amount) {
    return pluralize(name, amount).split(' ').map(word => capitalize(word)).join(' ')
  }

  static formatRecipeName(name) {
    const words = name.split(' ')
    const recipeWord = words.find(word => /recipe/.test(word))
    if (recipeWord) words.splice(words.indexOf(recipeWord), 1)
    return words.join(' ').toLowerCase()
  }

  static create(options) {
    if (options.type === 'recipe') {
      options.id = `recipe: ${ItemHandler.formatRecipeName(options.id)}`
    }

    if (items.has(options.id)) return
    const item = new itemTypes[options.type](options)
    items.set(item.id, item)
    return writeItems()
  }

  static update(options) {
    if (!items.has(options.id)) return ItemHandler.create(options)
    const item = new itemTypes[options.type](options)
    items.set(item.id, item)
    return writeItems()
  }

  static destroy(id) {
    if (!items.has(id)) return
    items.delete(id)
    return writeItems()
  }

  static baseCurrency() { return new itemTypes[baseCurrency.type](baseCurrency) }
  static all(filter) { return items.filter(filter) }
  static get SHOP() { return items.filter(item => item.shop) }
}

function findBaseCurrency() {
  const currencies = Array.from(items.filter(item => item.type === 'currency').values())
  const values = currencies.map(currency => currency.value)
  return currencies[values.indexOf(Math.min(...values))]
}

function writeItems() {
  return fs.writeFileSync(`${rootDir}/assets/items.json`, JSON.stringify(items.array().map(i => i.toJSON()), null, 2), 'utf8')
}

module.exports = ItemHandler
