const Collection = require('../Collection')
const Items = require('../items')
const Embed = require('../HakuEmbed')

const ongoing = new Map()

const roulette = {
  red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
}

const spaces = new Collection([
  [
    'numbers',
    {
      values: roulette.red
        .concat(roulette.black)
        .concat([0])
        .map(item => item.toString()),
      multiplier: 36,
    },
  ],
  ['dozens', { values: ['1-12', '13-24', '25-36'], multiplier: 3 }],
  ['columns', { values: ['1st', '2nd', '3rd'], multiplier: 3 }],
  ['halves', { values: ['1-18', '19-36'], multiplier: 2 }],
  ['parity', { values: ['even', 'odd'], multiplier: 2 }],
  ['colors', { values: ['red', 'black'], multiplier: 2 }],
])

const spaceLiterals = spaces
  .array()
  .reduce((spcs, cat) => spcs.concat(cat.values), [])
const maxBet = Items.resolveGroup('gold', 10)

class Roulette {
  constructor(channel) {
    this.channel = channel
    this.time = 30
    this.players = new Collection()
    this.bets = new Collection()
    this.wins = new Collection()
    this.ongoing = false
    this.winningSpaces = Roulette.generateWinningSpaces()
  }

  addBet(player, space, bet) {
    // Add player if doesn't exist
    if (!this.players.has(player.id)) this.players.set(player.id, player)

    // Add bet to bets
    const entry = this.bets.get(space) || {}
    entry[player.id] = bet
    this.bets.set(space, entry)
    player.inventory.consume(bet)

    // Add player to wins if the space is a winning space
    if (!this.winningSpaces.includes(space)) return
    const win = this.wins.get(player.id) || {}
    win[space] = Items.convertToCurrency(
      bet.currencyValue * Roulette.getMultiplier(space)
    )
    this.wins.set(player.id, win)
  }

  hasBet(user, space) {
    const entry = this.bets.get(space)
    return entry ? !!entry[user.id] : false
  }

  get statusEmbed() {
    const fields = Object.entries(this.bets.toJSON()).map(
      ([space, spaceBets]) => {
        const betString = Object.entries(spaceBets)
          .map(
            ([id, amount]) => `${this.players.get(id).displayName}: ${amount}`
          )
          .join('\n')

        return [space, betString, true]
      }
    )

    return new Embed()
      .setTitle('Roulette')
      .setDescription(`Time Left: ${this.time} seconds`)
      .setFields(fields)
      .setIcon(Embed.icons.GAME)
      .setColor(Embed.icons.SCARLET)
  }

  start() {
    this.ongoing = true

    return new Promise(resolve => {
      const interval = setInterval(() => {
        this.time -= 1

        if (this.time === 0) {
          clearInterval(interval)
          this.end()
          return resolve()
        }

        if (this.time % 10 === 0) {
          this.channel.send(`${this.time} seconds left for other users to bet!`)
        }
      }, 1e3)
    })
  }

  end() {
    this.ongoing = false
    ongoing.delete(this.channel.id)
  }

  rewardWinners() {
    for (const [id, wins] of this.wins) {
      const player = this.players.get(id)
      player.inventory.add(Roulette.getTotal(wins))
    }
  }

  get winnerFields() {
    return this.toFields(this.wins)
  }

  toFields(coll) {
    return Object.entries(coll.toJSON()).map(([id, wins]) => {
      const str = Object.entries(wins)
        .concat([['TOTAL', Roulette.getTotal(wins)]])
        .map(([space, amount]) => `${space}: ${amount}`)
        .join('\n')

      return [this.players.get(id).displayName, str, true]
    })
  }

  static getTotal(wins) {
    const totalValue = Object.values(wins).reduce(
      (total, item) => total + item.currencyValue,
      0
    )
    return Items.convertToCurrency(totalValue)
  }

  static findCreate(channel) {
    if (ongoing.has(channel.id)) return ongoing.get(channel.id)

    const instance = new Roulette(channel)
    ongoing.set(channel.id, instance)
    return instance
  }

  static getMultiplier(space) {
    return spaces.find(spc => spc.values.includes(space)).multiplier
  }

  static generateWinningSpaces() {
    const number = Math.floor(Math.random() * 37)
    if (number === 0) return [number.toString()]

    return [
      number.toString(),
      Roulette.getColor(number),
      Roulette.getColumn(number),
      Roulette.getParity(number),
      Roulette.getRange(number, 'dozens'),
      Roulette.getRange(number, 'halves'),
    ]
  }

  static getColor(number) {
    return roulette.red.includes(number) ? 'red' : 'black'
  }
  static getColumn(number) {
    return spaces.get('columns').values[(number - 1) % 3]
  }
  static getParity(number) {
    return spaces.get('parity').values[number % 2]
  }
  static getRange(number, size) {
    return spaces.get(size).values.find(value => {
      const min = parseInt(value.split('-')[0])
      const max = parseInt(value.split('-')[1])
      return number >= min && number <= max
    })
  }

  static resolveBet(str) {
    const words = str.split(' ')
    if (['for', 'on'].includes(words[words.length - 2])) {
      words.splice(words.length - 2, 1)
    }

    const space = words.pop()
    const bet = Items.resolveCollection(words.join(' '))

    return {
      bet: bet ? bet.currencies() : null,
      space,
    }
  }

  static get SPACES() {
    return spaceLiterals
  }
  static get MAXBET() {
    return maxBet
  }
}

module.exports = Roulette
