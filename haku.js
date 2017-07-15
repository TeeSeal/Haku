global._util = require('./util/all.js');
global._struct = require('./structures/all.js');
global.logr = require('logr');

const { token, ownerID } = require('./config');
const { AkairoClient } = require('discord-akairo');


const client = new AkairoClient({
  prefix: msg => _util.db.prefixes.get(msg.guild.id),
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: './commands/',
  inhibitorDirectory: './inhibitors/'
});

client.on('ready', () => logr.success('Haku ready!'));

client.login(token);
