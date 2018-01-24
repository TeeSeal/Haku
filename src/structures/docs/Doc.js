const request = require('snekfetch')
const Fuse = require('fuse.js')
const { MessageEmbed } = require('discord.js')

const DocBase = require('./DocBase')
const DocClass = require('./DocClass')
const DocTypedef = require('./DocTypedef')
const DocInterface = require('./DocInterface')

const docCache = new Map()
const ICON
  = 'https://cdn.discordapp.com/icons/222078108977594368/bc226f09db83b9176c64d923ff37010b.webp'

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

    this.fuse = new Fuse(this.toJSON(), {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 40,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name', 'description'],
      id: 'id',
    })

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

  get(query) {
    const [parentName, childName] = query
      .split(/\.|#/)
      .map(text => text.toLowerCase())

    const parent = this.children.get(parentName)
    if (!parent || !childName) return parent || null

    const child = parent.children.get(childName)
    return child || null
  }

  search(query) {
    const res = this.fuse.search(query).slice(0, 10)
    return res.map(id => this.get(id))
  }

  toJSON() {
    const parents = this.children.map(({ name, description }) => {
      return { name, description, id: name }
    })

    const children = this.children
      .map(parent => {
        return parent.children.map(child => {
          return {
            name: child.name,
            description: child.description,
            id: `${parent.name}#${child.name}`,
          }
        })
      })
      .reduce((a, b) => a.concat(b))

    return parents.concat(children)
  }

  baseEmbed() {
    const [docs, branch] = this.name.split('/')
    const author = {
      rpc: 'RPC Docs',
      commando: 'Commando Docs',
      main: `Discord.js Docs (${branch})`,
    }[docs]

    return new MessageEmbed().setAuthor(author, ICON).setColor(0x2296f3)
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
