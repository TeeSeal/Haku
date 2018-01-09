const { MessageEmbed } = require('discord.js')
const { paginate } = require('../util/Util')
const ReactionPagination = require('./reaction/ReactionPagination')

class HakuEmbed extends MessageEmbed {
  constructor(channel, opts = {}) {
    super(opts)
    this.channel = channel
    this.message = null
    this.sent = false
    this.icons = []
    this.pagination = opts.pagination
      ? HakuEmbed.parsePagination(opts.pagination)
      : null

    this.opts = opts
  }

  async send() {
    if (this.sent) return this.edit()
    this.setPage()
    this.message = await this.channel.send(this)
    this.sent = true
    if (this.pagination) this.handlePagination()
    return this
  }

  async edit() {
    if (!this.sent) return this.send()
    await this.message.edit(this)
    return this
  }

  attachIcon(name) {
    if (this.icons.includes(name)) return this
    this.icons.push(name)
    this.attachFiles([`src/assets/icons/${name}.png`])
    return this
  }

  setIcon(name) {
    if (!this.icons.includes(name)) this.attachIcon(name)
    this.setThumbnail(`attachment://${name}.png`)
    return this
  }

  setColor(name) {
    if (name in HakuEmbed.colors) super.setColor(HakuEmbed.colors[name])
    else super.setColor(name)
    return this
  }

  setAuthor(member) {
    if (member.user) {
      super.setAuthor(member.displayName, member.user.displayAvatarURL())
    } else {
      super.setAuthor(member.username, member.displayAvatarURL())
    }
    return this
  }

  addFields(fields) {
    for (const field of fields) this.addField(...field)
    return this
  }

  setFields(fields) {
    this.fields = []
    this.addFields(fields)
    return this
  }

  setPage(page, number) {
    if (!this.pagination) return
    if (!page && !number) {
      number = this.pagination.page
      page = this.pagination.items[number]
    }

    const method
      = this.pagination.type === 'fields' ? 'setFields' : 'setDescription'

    this[method](this.pagination.items[number])
    this.setPageNumber(number)
  }

  setPageNumber(number) {
    if (this.pagination.items.length < 1) return

    const { length } = this.pagination.items

    this.setFooter(
      `Page: ${number + 1}/${length} | Use the arrows to cycle through pages.`
    )
  }

  handlePagination() {
    new ReactionPagination(this.message, this.pagination.items, {
      current: this.pagination.page,
      users: this.opts.users,
    }).on('switch', (page, number) => {
      this.setPage(page, number)
      this.edit()
    })
  }

  static parsePagination(opts) {
    const paginated = paginate(opts.items, opts.by)

    let page = opts.page || 0
    if (page < 0) page = 0
    if (page > paginated.length) page = paginated.length - 1
    const result = { page, commandName: opts.commandName }

    if (paginated.length !== 0) {
      if (Array.isArray(opts.items[0])) {
        result.type = 'fields'
        result.items = paginated.map(pg => HakuEmbed.parseFields(pg))
      } else {
        result.type = 'description'
        result.items = paginated
      }
    }

    return result
  }

  static get colors() {
    return {
      yellow: 16763904,
      red: 16731469,
      blue: 6711039,
      purple: 12517631,
      green: 5025610,
      cyan: 6750207,
      gold: 16758861,
      orange: 16029762,
      scarlet: 13369446,
    }
  }

  static parseFields(fields) {
    if (!fields) return []
    return fields.map(field => {
      return {
        name: field[0],
        value: field[1],
        inline: field[2],
      }
    })
  }
}

module.exports = HakuEmbed
