const DocElement = require('./DocElement')
const { flatten } = require('../../util')

class DocProp extends DocElement {
  constructor(parent, data) {
    super(parent.doc, DocElement.types.PROP, data, parent)
    this.access = data.access || 'public'
    this.type = flatten(data.type)[0]
  }

  get formattedName() {
    return `${this.parent.name}#${this.name}`
  }
}

module.exports = DocProp
