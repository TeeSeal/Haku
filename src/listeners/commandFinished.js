const { Listener } = require('discord-akairo')
const logr = require('logr')

function exec(msg, cmd) {
  let str = `${msg.author.tag} > ${cmd.id}`
  if (msg.guild) str = `${msg.guild.name} :: ${msg.channel.name} :: ${str}`
  logr.info(str)
}

module.exports = new Listener('commandFinished', exec, {
  emitter: 'commandHandler',
  event: 'commandFinished',
})
