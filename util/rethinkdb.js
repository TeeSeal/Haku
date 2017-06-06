const r = require('rethinkdbdash'); // eslint-disable-line

const templates = {
  client: {
    blacklist: {},
    disabled: {}
  },
  users: { inventory: {} },
  guilds: {
    blacklist: {},
    disabled: {},
    reps: {},
    defaultVolume: 25,
    maxSongDuration: 15,
    playlists: {}
  },
  channels: {
    blacklist: {},
    disabled: {}
  },
  items: {}
};

const strip = {
  client(client) {
    return { id: client.id };
  },
  users(user) {
    const { id, username, discriminator } = user;
    return { id, username, discriminator };
  },
  guilds(guild) {
    const { id, name } = guild;
    return { id, name };
  },
  channels(channel) {
    const { id, name } = channel;
    return { id, name };
  },
  items(item) {
    const { id, worth, inShop } = item;
    return { id, worth, inShop };
  }
};

const defaults = { items: [{ id: 'gem', worth: 1, inShop: false }] };

class RethinkDB {
  constructor(options) {
    this.r = r(options);
    this.checkTables().then(() => this.generateDefaults());
  }

  async get(table, obj, key) {
    await this.check(table, obj);

    let query = this.r.table(table).get(obj.id);
    if (key) query = query(key);
    return query;
  }

  async update(table, obj) {
    await this.check(table, obj);
    return this.r.table(table).get(obj.id).update(obj);
  }

  async add(table, obj) {
    const exists = await this.r.table(table).get(obj.id);
    if (exists) return;
    await this.r.table(table).insert(obj);
  }

  async remove(table, obj) {
    const query = this.r.table(table).get(obj.id);
    const exists = await query;
    if (!exists) return;
    await query.delete();
  }

  async rep(member, amount) {
    await this.check('guild', member.guild);
    return this.r.table('guilds').get(member.guild.id)
      .update({ reps: { [member.id]: this.r.row('reps')(member.id).default(0).add(amount) } });
  }

  async check(type, obj) {
    if (!templates[type]) return;
    const exists = await this.r.table(type).get(obj.id);
    if (exists) return true;
    return this.r.table(type).insert(create(type, obj));
  }

  async checkTables() {
    const dbTables = await this.r.tableList();
    const tables = ['client', 'users', 'guilds', 'channels', 'items'];

    for (const table of tables) {
      if (!dbTables.includes(table)) {
        await this.r.tableCreate(table);
      }
    }
  }

  generateDefaults() {
    for (const item of defaults.items) this.add('items', item);
  }
}

function create(type, obj) {
  const stripped = strip[type](obj);
  Object.assign(stripped, templates[type]);
  return stripped;
}

module.exports = new RethinkDB({ db: 'haku' });
