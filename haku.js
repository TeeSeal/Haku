global.helpers = require('./helpers.js');
Object.assign(global, require('common-tags'));

const { token, prefix, ownerID } = require('./config');
const { AkairoClient } = require('discord-akairo');
const logr = require('logr');

const client = new AkairoClient({
  prefix,
  ownerID,
  handleEdits: true,
  commandDirectory: './commands/',
  inhibitorDirectory: './inhibitors/'
});

client.on('ready', () => logr.success('Haku ready!'));

client.login(token);
