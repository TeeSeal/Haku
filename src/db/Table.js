const { Collection } = require('../structures/all.js');
const { defaults } = require('./templates.js');

class Table {
  constructor(table) {
    this.remote = table;
    this.name = table.getTableName();
    this.entries = new Collection();
    this.sync();
  }

  async sync() {
    await this.remote.sync();
    const entries = await this.remote.all();
    for (const entry of entries) this.entries.set(entry.id, entry);
  }

  get(id) {
    return this.entries.get(id) || this.set(id);
  }

  set(id, obj = {}) {
    const entry = this.entries.get(id) || this.create(id);
    entry.set(obj);
    this.entries.set(id, entry);
    entry.save().catch(e => e);
    return entry;
  }

  create(id) {
    const obj = Object.assign({ id }, defaults[this.name]);
    return this.remote.build(obj);
  }

  delete(id) {
    if (this.entries.has(id)) {
      this.entries.get(id).destroy();
      this.entries.delete(id);
    }
  }
}

module.exports = Table;
