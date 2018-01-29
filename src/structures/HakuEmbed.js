const { MessageEmbed, Util: { splitMessage } } = require('discord.js')
const { embed: { textLimit, fieldLimit } } = require('../../config')
const { paginate } = require('../util')
const ReactionPagination = require('./reaction/ReactionPagination')

class HakuEmbed extends MessageEmbed {
  constructor(channel) {
    super()
    this.channel = channel
    this.message = null
    this.sent = false

    this.icons = []
    this.users = null

    this.pagination = null
    this.page = 0
    this._description = ''
    this._fields = []
    this.textLimit = textLimit
    this.fieldLimit = fieldLimit
  }

  // Message actions
  async send() {
    if (!this.channel) throw new Error('No channel given.')
    if (this.sent) return this.edit()
    this.setPagination()
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

  // Custom embed methods
  attachIcon(icon) {
    if (this.icons.includes(icon)) return this
    this.icons.push(icon)
    this.attachFiles([`src/assets/icons/${icon}`])
    return this
  }

  setIcon(icon) {
    if (!this.icons.includes(icon)) this.attachIcon(icon)
    this.setThumbnail(`attachment://${icon}`)
    return this
  }

  addUser(user) {
    if (!this.users) this.users = []
    this.users.push(user)
  }

  setUsers(users) {
    this.users = users
  }

  setTextLimit(number) {
    if (number > 2000 || number < 1) return this
    this.textLimit = number
    return this
  }

  setFieldLimit(number) {
    if (number > 20 || number < 1) return this
    this.fieldLimit = number
    return this
  }

  setPage(number) {
    this.page = number
    return this
  }

  // Overloaded methods
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

  setDescription(description, sup = false) {
    if (sup) super.setDescription(description)
    else this._description = description
    return this
  }

  addField(name, value, inline = false) {
    this._fields.push([name, value, inline])
    return this
  }

  // Util methods
  addFields(fields, sup = false) {
    for (const field of fields) {
      if (sup) super.addField(...field)
      else this.addField(...field)
    }

    return this
  }

  setFields(fields, sup = false) {
    this.clearFields()
    this.addFields(fields, sup)
    return this
  }

  clearFields() {
    this.fields = []
    return this
  }

  // Main pagination methods
  setPagination() {
    this.checkDescriptionPagination()
    this.checkFieldPagination()
    this.editPage()
  }

  editPage(page, number) {
    if (!this.pagination) return
    if (!page && !number) {
      number = this.pagination.page
      page = this.pagination.items[number]
    }

    const method
      = this.pagination.type === 'fields' ? 'setFields' : 'setDescription'

    this[method](this.pagination.items[number], true)
    this.editPageNumber(number)
    this.pagination.page = number
  }

  editPageNumber(number, tooltip = true) {
    if (this.pagination.items.length < 2) return

    const { items, totalSize } = this.pagination
    let footer = `Page: ${number + 1}/${items.length} | ${totalSize} items`

    if (tooltip) footer += ' | Use the arrows to cycle through pages.'

    this.setFooter(footer)
  }

  handlePagination() {
    new ReactionPagination(this.message, this.pagination.items, {
      current: this.pagination.page,
      users: this.users,
    })
      .on('switch', (page, number) => {
        this.editPage(page, number)
        this.edit()
      })
      .on('end', () => {
        this.editPageNumber(this.pagination.page, false)
        this.edit()
      })
  }

  // Paginatino checks
  checkDescriptionPagination() {
    if (Array.isArray(this._description)) {
      this.pagination = HakuEmbed.parsePagination({
        items: this._description,
        page: this.page,
      })
      return
    }

    if (!this._description.length > this.textLimit) {
      return super.setDescription(this._description)
    }
    const chunks = splitMessage(this._description, {
      maxLength: this.textLimit,
      char: ' ',
      append: '...',
      prepend: '...',
    })

    this.pagination = HakuEmbed.parsePagination({
      items: chunks,
      page: this.page,
      by: 1,
    })
  }

  checkFieldPagination() {
    if (this._fields.length <= this.fieldLimit) {
      return this.setFields(this._fields, true)
    }

    if (this.pagination) {
      throw new Error(
        "can't paginate both fields and description at the same time."
      )
    }

    this.pagination = HakuEmbed.parsePagination({
      items: this._fields,
      page: this.page,
      by: this.fieldLimit,
    })
  }

  // Static helpers
  static parsePagination(opts) {
    if (!opts.items) return null

    const items = Array.from(opts.items)
    if (!items || items.length === 0) return null

    const paginated = paginate(items, opts.by)

    let page = opts.page || 0
    if (page < 0) page = 0
    if (page >= paginated.length) page = paginated.length - 1
    const result = {
      totalSize: opts.items.length,
      page,
    }

    result.type = Array.isArray(items[0]) ? 'fields' : 'description'
    result.items = paginated

    return result
  }

  static resolvePage(word) {
    if (!word || isNaN(word)) return null
    const num = parseInt(word)
    if (num < 1) return null
    return num
  }

  // Constants
  static get colors() {
    return {
      YELLOW: 16763904,
      RED: 16731469,
      BLUE: 6711039,
      PURPLE: 12517631,
      GREEN: 5025610,
      CYAN: 6750207,
      GOLD: 16758861,
      ORANGE: 16029762,
      SCARLET: 13369446,
      WHITE: 15921906,
    }
  }

  static get icons() {
    return {
      CLEAR: 'clear.png',
      CRAFT: 'craft.png',
      GAME: 'game.png',
      LIST: 'list.png',
      PAUSE: 'pause.png',
      PLAY: 'play.png',
      PLAYLIST_ADD: 'playlistAdd.png',
      SHOP: 'shop.png',
      SKIP: 'skip.png',
      TIME: 'time.png',
      TRADE: 'trade.png',
      VOLUME_UP: 'volumeUp.png',
      VOLUME_DOWN: 'volumeDown.png',
      POLL: 'poll.png',
      STOP: 'stop.png',
    }
  }
}

module.exports = HakuEmbed
