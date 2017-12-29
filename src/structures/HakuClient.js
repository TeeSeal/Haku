const akairo = require('discord-akairo')
const logr = require('logr')
const keychain = require('../../keychain')

const SequelizeDatabase = require('../db/SequelizeDatabase')
const InventoryHandler = require('./items/InventoryHandler')
const MusicHandler = require('./music/MusicHandler')

class HakuClient extends akairo.AkairoClient {
  constructor(opts) {
    if (!opts.database) throw new Error('please specify a database.')
    super(opts)

    this.db = new SequelizeDatabase(opts.database)
    this.inventories = null
    this.music = null
  }

  init() {
    logr.info('Connecting to database...')
    this.db.init().then(db => {
      logr.success('OK')

      logr.info('Setting up inventories...')
      this.inventories = new InventoryHandler(db.users)
      logr.success('OK')

      logr.info('Setting up music...')
      this.music = new MusicHandler(keychain)
      logr.success('OK')

      logr.info('Logging in...')
      this.login(keychain.token)
    }).catch(err => { throw err })
  }
}

module.exports = HakuClient

Object.assign(akairo.CommandUtil.prototype, {
  info(content, opts) {
    const name = this.message.member ? this.message.member.displayName : this.message.author.username
    return this.send(`**${name}** | ${content}`, opts)
  },

  success(content, opts) { return this.info(`✅ ${content}`, opts) },
  error(content, opts) { return this.info(`❌ ${content}`, opts) },
})
