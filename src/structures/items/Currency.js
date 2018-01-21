const ItemGroup = require('./ItemGroup')
const pluralize = require('pluralize')
const { filterObject, capitalize } = require('../../util')

class Currency extends ItemGroup {
  constructor(opts) {
    super(opts)

    this.emoji = opts.emoji
    this.description = opts.description
  }

  toJSON() {
    return filterObject(
      this,
      ['id', 'value', 'description', 'emoji', 'type'],
      true
    )
  }

  get name() {
    return (
      this.emoji
      || pluralize(this.id, Math.abs(this.amount) || 1)
        .split(' ')
        .map(word => capitalize(word))
        .join(' ')
    )
  }
}

module.exports = Currency
