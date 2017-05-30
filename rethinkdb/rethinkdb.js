const r = require('rethinkdbdash')({ db: 'haku' }); // eslint-disable-line

const templates = {
  user: { profileTemplate: 0 },
  guild: {
    blacklist: [],
    reps: {}
  }
};

const strip = {
  user(user) {
    const { id, username, discriminator } = user;
    return { id, username, discriminator };
  },
  guild(guild) {
    const { id, name } = guild;
    return { id, name };
  }
};

const helpers = {
  async get(type, obj) {
    const plural = `${type}s`;
    const item = await r.table(plural).get(obj.id);
    if (item) return item;

    const created = create(type, obj);
    await await r.table(plural).insert(created);
    return created;
  },
  async update(type, obj) {
    const plural = `${type}s`;
    const query = r.table(plural).get(obj.id);
    const item = await query;
    if (item) return await query.update(obj);
  },
  async getBlacklist(guild) {
    if (guild) {
      await check('guild', guild);
      return await r.table('guilds').get(guild.id)('blacklist');
    }
    return Object.keys(await r.table('blacklist'));
  },
  async rep(member, amount) {
    await check('guild', member.guild);
    return await r.table('guilds').get(member.guild.id)
      .update({ reps: { [member.id]: r.row('reps')(member.id).default(0).add(amount) } });
  }
};

async function check(type, obj) {
  const plural = `${type}s`;
  const exists = await r.table(plural).hasFields(obj.id);
  if (exists.length > 0) return true;
  return await r.table(plural).insert(create(type, obj));
}

async function checkTables() {
  const dbTables = await r.tableList();
  const tables = ['users', 'guilds', 'blacklist'];

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
