global.helpers = require('./util/helpers.js');
global.structures = require('./structures/all.js');

const { token, prefix, ownerID } = require('./config');
const { AkairoClient } = require('discord-akairo');
const logr = require('logr');

const client = new AkairoClient({
  prefix,
  ownerID,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: './commands/',
  inhibitorDirectory: './inhibitors/'
});

client.on('ready', () => logr.success('Haku ready!'));

client.login(token);
