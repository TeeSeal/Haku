const r = require('rethinkdbdash')({ db: 'haku' }); // eslint-disable-line

const templates = {
  client: {
    blacklist: {},
    disabled: {}
  },
  users: { gems: 0 },
  guilds: {
    blacklist: {},
    disabled: {},
    reps: {},
    defaultVolume: 25,
    playlists: {}
  },
  channels: {
    blacklist: {},
    disabled: {}
  }
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
  }
};

const helpers = {
  async get(table, obj, key) {
    await check(table, obj);

    let query = r.table(table).get(obj.id);
    if (key) query = query(key);
    return query;
  },
  async update(table, obj) {
    await check(table, obj);
    return r.table(table).get(obj.id).update(obj);
  },
  async rep(member, amount) {
    await check('guild', member.guild);
    return r.table('guilds').get(member.guild.id)
      .update({ reps: { [member.id]: r.row('reps')(member.id).default(0).add(amount) } });
  }
};

async function check(type, obj) {
  const exists = await r.table(type).hasFields(obj.id);
  if (exists.length > 0) return true;
  return r.table(type).insert(create(type, obj));
}

async function checkTables() {
  const dbTables = await r.tableList();
  const tables = ['client', 'users', 'guilds', 'channels'];

  for (const table of tables) {
    if (!dbTables.includes(table)) {
      await r.tableCreate(table);
    }
  }
}

function create(type, obj) {
  const stripped = strip[type](obj);
  Object.assign(stripped, templates[type]);
  return stripped;
}

checkTables();
Object.assign(r, helpers);
module.exports = r;
