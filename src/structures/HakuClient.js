const { AkairoClient } = require('discord-akairo');
const keychain = require('../../keychain.json');

const SequelizeDatabase = require('../db/SequelizeDatabase.js');
const InventoryHandler = require('./items/InventoryHandler.js');
const MusicHandler = require('./music/MusicHandler.js');

class HakuClient extends AkairoClient {
  constructor(options) {
    if (!options.database) throw new Error('please specify a database.');
    super(options);

    this.db = new SequelizeDatabase(options.database);
    this.inventories = new InventoryHandler(this.db.users);
    this.music = new MusicHandler(keychain);
  }
}

module.exports = HakuClient;
