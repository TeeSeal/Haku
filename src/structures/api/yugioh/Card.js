class Card {
  constructor(options) {
    this.name = options.name
    this.image = options.image_path
    this.description = options.text
    this.url = options.tcgplayer_link

    this.cardType = this.getCardType(options)

    this.type = options.type
    this.monsterTypes = options.monster_types
    this.level = options.stars

    this.linkMarkers = options.link_markers
    this.linkNumber = options.link_number

    this.species = options.species
    this.attribute = options.attribute

    this.materials = options.materials

    this.legality = {
      tcg: options.legality.TCG.Traditional || options.legality.TCG.Advanced,
      ocg: options.legality.OCG.Advanced,
    }

    this.attack = options.attack
    this.defense = options.defense

    this.property = options.property
  }

  getCardType(options) {
    const type = ['Pendulum', 'Xyz', 'Synchro', 'Fusion', 'Link']
      .find(t => options[`is_${t.toLowerCase()}`])

    return type || 'Normal'
  }

  get monsterRank() {
    if (this.cardType === 'Link') return `Rating ${this.linkNumber}`
    if (this.cardType === 'Xyz') return `Rank ${this.level}`
    return `Level ${this.level}`
  }

  get shortDescription() {
    if (this.type === 'Spell') return `${this.property} Spell Card`
    if (this.type === 'Trap') return `${this.property} Trap Card`
    return `${this.monsterRank} ${this.attribute} ${this.species} ${this.monsterTypes.join(' ')} Monster`
  }
}

module.exports = Card
