const HTTPClient = require('../../HTTPClient.js')
const Fuse = require('fuse.js')
const Card = require('./Card.js')

class YuGiOh extends HTTPClient {
  constructor() {
    super({ baseURL: 'https://www.ygohub.com/api/' })
    this.cards = null
    this.fuse = null
    this.init()
  }

  async init() {
    this.cards = await this.get('all_cards').then(res => res.cards)
    this.fuse = new Fuse(this.cards.map(card => ({ name: card })), {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
      id: 'name',
    })
  }

  async findCard(query) {
    const name = this.fuse.search(query)[0]
    if (!name) return null

    const card = await this.get('card_info', { name }).then(res => res.card)
    if (!card) return null

    return new Card(card)
  }
}

module.exports = new YuGiOh()
