const ItemGroup = require('./ItemGroup.js');
const pluralize = require('pluralize');
const { filterObject, capitalize } = require('../../util/Util.js');

class Currency extends ItemGroup {
  constructor(options) {
    super(options);

    this.emoji = options.emoji;
    this.description = options.description;
  }

  toJSON() {
    return filterObject(this, ['id', 'value', 'description', 'emoji', 'type']);
  }

  get name() {
    return this.emoji || pluralize(this.id, Math.abs(this.amount) || 1)
      .split(' ').map(word => capitalize(word)).join(' ');
  }
}

module.exports = Currency;
