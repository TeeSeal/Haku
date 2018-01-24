const DocElement = require('./DocElement')
const { flatten } = require('../../util')

class DocTypedef extends DocElement {
  constructor(doc, data) {
    super(doc, DocElement.types.TYPEDEF, data)
    this.type = flatten(data.type[0])
  }
}

module.exports = DocTypedef
