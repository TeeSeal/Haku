const { Command } = require('discord-akairo')

function exec(msg) {
  return msg.channel.send('https://discordapp.com/api/oauth2/authorize?client_id=307913579883921410&scope=bot&permissions=37080128')
}

module.exports = new Command('invite', exec, {
  aliases: ['invite', 'inv'],
  description: 'Get this bot\'s invite link.',
})
