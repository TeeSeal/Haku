const { Listener } = require('discord-akairo')
const logr = require('logr')

function exec(msg, cmd) {
  logr.info('Command', `${msg.guild.name} :: ${msg.channel.name} :: ${msg.author.tag} > ${cmd.id}`)
}

module.exports = new Listener('commandFinished', exec, {
  emitter: 'commandHandler',
  eventName: 'commandFinished',
})
