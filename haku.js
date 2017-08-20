const { AkairoClient } = require('discord-akairo');
const logr = require('logr');
const { token, ownerID } = require('./config.json');
const SequelizeDatabase = require('./src/db/SequelizeDatabase.js');


const client = new AkairoClient({
  prefix: msg => client.db.guilds
      .get(msg.guild ? msg.guild.id : 'dm', 'prefix'),
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: 'src/commands/',
  inhibitorDirectory: 'src/inhibitors/',
  listenerDirectory: 'src/listeners/'
});
new SequelizeDatabase(client).init();

client.on('ready', () => logr.success('Haku ready!'));

client.login(token);
