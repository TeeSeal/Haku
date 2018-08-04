class Card {
  constructor (opts) {
    this.name = opts.name
    this.image = opts.image_path
    this.description = opts.text
    this.url = opts.tcgplayer_link

    this.cardType = this.getCardType(opts)

    this.type = opts.type
    this.monsterTypes = opts.monster_types
    this.level = opts.stars

    this.linkMarkers = opts.link_markers
    this.linkNumber = opts.link_number

    this.species = opts.species
    this.attribute = opts.attribute

    this.materials = opts.materials

    this.legality = {
      tcg: opts.legality.TCG.Traditional || opts.legality.TCG.Advanced,
      ocg: opts.legality.OCG.Advanced
    }

    this.attack = opts.attack
    this.defense = opts.defense

    this.property = opts.property
  }

  getCardType (opts) {
    const type = ['Pendulum', 'Xyz', 'Synchro', 'Fusion', 'Link'].find(
      t => opts[`is_${t.toLowerCase()}`]
    )

    return type || 'Normal'
  }

  get monsterRank () {
    if (this.cardType === 'Link') return `Rating ${this.linkNumber}`
    if (this.cardType === 'Xyz') return `Rank ${this.level}`
    return `Level ${this.level}`
  }

  get shortDescription () {
    if (this.type === 'Spell') return `${this.property} Spell Card`
    if (this.type === 'Trap') return `${this.property} Trap Card`
    return `${this.monsterRank} ${this.attribute} ${
      this.species
    } ${this.monsterTypes.join(' ')} Monster`
  }
}

module.exports = Card
