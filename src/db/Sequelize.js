const Sequelize = require('sequelize');
const Table = require('./Table.js');
const { templates } = require('./templates.js');

class SequelizeDatabase {
  constructor() {
    this._db = new Sequelize('haku', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: false,
      storage: 'src/db/database.sqlite'
    });

    for (const template in templates) {
      const table = this._db.define(template, templates[template]);
      this[template] = new Table(table);
    }
  }
}

module.exports = SequelizeDatabase;
