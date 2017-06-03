const { Command } = require('discord-akairo');
const moment = require('moment');
require('moment-duration-format');

function exec(msg) {
  msg.util.reply(moment.duration(msg.client.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'));
}

module.exports = new Command('stats', exec, {
  aliases: ['stats'],
  description: 'Get some information about the bot.'
});
