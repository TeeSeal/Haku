const { Command } = require('discord-akairo')
const moment = require('moment')
require('moment-duration-format')

function exec(msg) {
  msg.util.info(moment.duration(this.client.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'))
}

module.exports = new Command('stats', exec, {
  aliases: ['stats'],
  description: 'Get some information about the bot.',
})
