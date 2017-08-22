const moment = require('moment');

class Anime {
  constructor(options) {
    const attr = options.attributes;
    this.title = attr.titles.en_jp;
    this.japaneseTitle = attr.titles.ja_jp;
    this.rating = Math.floor(+attr.averageRating / 20);
    this.ageRating = attr.ageRating;
    this.type = attr.subtype;
    this.status = attr.status;
    this.episodeCount = attr.episodes || '??';
    this.nsfw = attr.nsfw;
    this.youtubeID = attr.youtubeVideoId;
    this.poster = attr.posterImage.original.split('?')[0];
    this.synopsis = attr.synopsis;
    this.genres = attr.genres || [];
    this.url = `https://kitsu.io/anime/${attr.slug}`;

    this._startDate = attr.startDate;
    this._endDate = attr.endDate;
  }

  get trailer() {
    if (this.youtubeID) return `https://www.youtube.com/watch?v=${this.youtubeID}`;
    return 'None';
  }

  get startDate() {
    if (this._startDate) return moment(this._startDate).format('LL');
    return 'Not yet aired.';
  }

  get endDate() {
    if (this._endDate) return moment(this._endDate).format('LL');
    return 'Not yet finished.';
  }
}

module.exports = Anime;
