const DocElement = require('./DocElement')
const { flatten } = require('../../util')

class DocParam extends DocElement {
  constructor(parent, data) {
    super(parent.doc, DocElement.types.PARAM, data, parent)
    this.type = flatten(data.type)
    this.optional = data.optional
  }

  get formattedName() {
    return this.optional ? `\`[${this.name}]\`` : `\`${this.name}\``
  }

  get formattedType() {
    return this.doc.formatType(this.type)
  }

  get url() {
    return null
  }
}

module.exports = DocParam
