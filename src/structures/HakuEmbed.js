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
    if (!this.channel) throw new Error('No channel given.')
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
    this.clearFields()
    this.addFields(fields)
    return this
  }

  clearFields() {
    this.fields = []
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
    this.pagination.page = number
  }

  setPageNumber(number, tooltip = true) {
    if (this.pagination.items.length < 2) return

    const { items, totalSize } = this.pagination
    let footer = `Page: ${number + 1}/${items.length} | ${totalSize} items`

    if (tooltip) footer += ' | Use the arrows to cycle through pages.'

    this.setFooter(footer)
  }

  handlePagination() {
    if (this.pagination.items.length < 2) return
    new ReactionPagination(this.message, this.pagination.items, {
      current: this.pagination.page,
      users: this.opts.users,
    })
      .on('switch', (page, number) => {
        this.setPage(page, number)
        this.edit()
      })
      .on('end', () => {
        this.setPageNumber(this.pagination.page, false)
        this.edit()
      })
  }

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
      commandName: opts.commandName,
    }

    result.type = Array.isArray(items[0]) ? 'fields' : 'description'
    result.items = paginated

    return result
  }

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

  static resolvePage(word) {
    if (!word || isNaN(word)) return null
    const num = parseInt(word)
    if (num < 1) return null
    return num
  }
}

module.exports = HakuEmbed
