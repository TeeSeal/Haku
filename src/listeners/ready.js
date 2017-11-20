const { Listener } = require('discord-akairo')
const logr = require('logr')

function exec() {
  logr.success(`All systems online! Logged in as ${this.client.user.tag}.`)
}

module.exports = new Listener('ready', exec, {
  emitter: 'client',
  event: 'ready',
})
