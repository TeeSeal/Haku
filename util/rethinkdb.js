const r = require('rethinkdbdash'); // eslint-disable-line
const { prefix } = require('../config');

const templates = {
  client: { blacklist: {} },
  users: { inventory: {} },
  guilds: {
    prefix,
    blacklist: {},
    disabled: {},
    reps: {},
    defaultVolume: 25,
    maxVolume: 100,
    maxSongDuration: 15,
    songLimit: 100,
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

class RethinkDB {
  constructor(options) {
    this.r = r(options);
    this.checkTables().then(() => this.loadPrefixes());
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
    const exists = await this.r.table(type).get(obj.id);
    if (exists) return;
    await this.r.table(type).insert(create(type, obj));
    if (type === 'guilds') this.prefixes.set(obj.id, prefix);
    return;
  }

  async checkTables() {
    const dbTables = await this.r.tableList();
    const tables = ['client', 'users', 'guilds', 'channels'];

    for (const table of tables) {
      if (!dbTables.includes(table)) {
        await this.r.tableCreate(table);
      }
    }
  }

  async loadPrefixes() {
    this.prefixes = new Map(await this.r.table('guilds').map(guild => [guild('id'), guild('prefix')]));
  }
}

function create(type, obj) {
  const stripped = strip[type](obj);
  Object.assign(stripped, templates[type]);
  return stripped;
}

module.exports = new RethinkDB({ db: 'haku' });
