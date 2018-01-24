const request = require('snekfetch')

const DocBase = require('./DocBase')
const DocClass = require('./DocClass')
const DocTypedef = require('./DocTypedef')
const DocInterface = require('./DocInterface')

const docCache = new Map()

class Doc extends DocBase {
  constructor(name, docs) {
    super()
    this.name = name
    this.docs = docs
    this.baseURL = `https://discord.js.org/#/docs/${name}/`
    this.repoURL = Doc.getRepoURL(name)

    this.adoptAll(docs.classes, DocClass)
    this.adoptAll(docs.typedefs, DocTypedef)
    this.adoptAll(docs.interfaces, DocInterface)

    docCache.set(name, this)
  }

  formatType(types) {
    return types
      .map(text => {
        if (!/^\w+$/.test(text)) return `\\${text}`
        const typeElem = this.children.get(text.toLowerCase())
        if (!typeElem) return `**${text}**`
        return `**${typeElem.link}**`
      })
      .join('')
  }

  resolve(query) {
    let result = this.get(
      ...query.split(/\.|#/).map(text => text.toLowerCase())
    )
    if (result) return result
  }

  get(parentName, childName) {
    const parent = this.children.get(parentName)
    if (!parent || !childName) return parent || null

    const child = parent.children.get(childName)
    return child || null
  }

  static getRepoURL(id) {
    const [name, branch] = id.split('/')
    const project = {
      main: 'discord.js',
      rpc: 'RPC',
      commando: 'Commando',
    }[name]

    return `https://github.com/discordjs/${project}/blob/${branch}/`
  }

  static async fetch(version) {
    const [dev, project, branch, name] = {
      commando: ['Gawdl3y', 'discord.js-commando', 'master', 'commando/master'],
      rpc: ['devsnek', 'discord-rpc', 'master', 'rpc/master'],
    }[version] || ['hydrabolt', 'discord.js', version, `main/${version}`]

    if (docCache.has(name)) return docCache.get(name)

    const { text } = await request.get(
      `https://raw.githubusercontent.com/${dev}/${project}/docs/${branch}.json`
    )

    return new Doc(name, JSON.parse(text))
  }
}

module.exports = Doc
