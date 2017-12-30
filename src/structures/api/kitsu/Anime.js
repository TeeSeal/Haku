const moment = require('moment')

class Anime {
  constructor(opts) {
    const attr = opts.attributes
    this.title = attr.titles.en_jp
    this.japaneseTitle = attr.titles.ja_jp
    this.rating = Math.ceil(+attr.averageRating / 20)
    this.ageRating = attr.ageRating
    this.ageRatingGuide = attr.ageRatingGuide
    this.episodeCount = attr.episodeCount || 'N/A'
    this.genres = attr.genres.length > 0 ? attr.genres : ['N/A']
    this.type = attr.subtype
    this.status = attr.status
    this.youtubeID = attr.youtubeVideoId
    this.poster = attr.posterImage.original.split('?')[0]
    this.synopsis = attr.synopsis
    this.url = `https://kitsu.io/anime/${attr.slug}`

    this._startDate = attr.startDate
    this._endDate = attr.endDate
  }

  get trailer() {
    if (this.youtubeID) {
      return `https://www.youtube.com/watch?v=${this.youtubeID}`
    }
    return 'N/A'
  }

  get ageRatingString() {
    if (![this.ageRating, this.ageRatingGuide].some(prop => prop)) return 'N/A'
    return `${this.ageRating}${
      this.ageRatingGuide ? ` | ${this.ageRatingGuide}` : ''
    }`
  }

  get startDate() {
    if (this._startDate) return moment(this._startDate).format('LL')
    return 'Not yet aired.'
  }

  get endDate() {
    if (this._endDate) return moment(this._endDate).format('LL')
    return null
  }

  get airWeekDay() {
    if (this._startDate) return `${moment(this._startDate).format('dddd')}s`
    return null
  }

  get optionalField() {
    return this.endDate
      ? ['End Date', this.endDate, true]
      : this.airWeekDay
        ? ['Currently airing on', this.airWeekDay, true]
        : ['End Date', 'Not yet finished', true]
  }
}

module.exports = Anime
