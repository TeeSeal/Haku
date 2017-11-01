const HakuClient = require('./src/structures/HakuClient.js')
const { ownerID } = require('./config.json')

const client = new HakuClient({
  prefix: msg => client.db.guilds
    .get(msg.guild ? msg.guild.id : 'dm', 'prefix'),
  ownerID,
  allowMention: true,
  handleEdits: true,
  automateCategories: true,
  commandDirectory: 'src/commands/',
  inhibitorDirectory: 'src/inhibitors/',
  listenerDirectory: 'src/listeners/',
  database: 'src/db/database.sqlite',
})

client.init()
