const Sequelize = require('sequelize');
const SequelizeProvider = require('./SequelizeProvider.js');
const tables = require('./tables.js');

class SequelizeDatabase {
  constructor(client, key) {
    this._db = new Sequelize('haku', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'src/db/database.sqlite'
    });

    this.client = client;
    client[key || 'db'] = this;
    this.init();
  }

  init() {
    for (const [name, options] of Object.entries(tables)) {
      const table = this._db.define(name, options.schema);

      options.defaultValues = {};
      for (const [key, model] of Object.entries(options.schema)) {
        if (model.defaultValue) options.defaultValues[key] = model.defaultValue;
      }

      this[name] = new SequelizeProvider(table, options);
    }
  }
}

module.exports = SequelizeDatabase;
