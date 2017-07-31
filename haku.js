const { AkairoClient } = require('discord-akairo');
const logr = require('logr');
const { token, ownerID } = require('./config.json');
const SequelizeDatabase = require('./src/db/Sequelize.js');


const client = new AkairoClient({
  prefix: msg => client.db.guilds
    .get(msg.guild ? msg.guild.id : 'dm').prefix,
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: 'src/commands/',
  inhibitorDirectory: 'src/inhibitors/',
  listenerDirectory: 'src/listeners/'
});
client.db = new SequelizeDatabase();

client.on('ready', () => logr.success('Haku ready!'));

client.login(token);
