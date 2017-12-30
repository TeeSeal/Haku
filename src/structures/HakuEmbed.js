const { MessageEmbed } = require('discord.js')
const { paginate } = require('../util/Util')

class HakuEmbed extends MessageEmbed {
  constructor(channel, opts = {}) {
    super(opts)
    this.channel = channel
    this.msg = null
    this.sent = false
    this.icons = []
  }

  async send() {
    if (this.sent) return this.edit()
    this.msg = await this.channel.send(this)
    this.sent = true
    return this
  }

  async edit() {
    if (!this.sent) return this.send()
    await this.msg.edit(this)
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
    if (name in Embed.colors) super.setColor(Embed.colors[name])
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
}

module.exports = HakuEmbed
