const { token, ownerID, prefix } = require('./config');
const { AkairoClient } = require('discord-akairo');
const { db } = require('./util/all.js');
const logr = require('logr');


const client = new AkairoClient({
  prefix: msg => {
    if (msg.channel.type === 'dm') return prefix;
    return db.prefixes.get(msg.guild.id) || prefix;
  },
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: './commands/',
  inhibitorDirectory: './inhibitors/',
  listenerDirectory: './listeners/'
});

client.on('ready', () => logr.success('Haku ready!'));

client.login(token);
