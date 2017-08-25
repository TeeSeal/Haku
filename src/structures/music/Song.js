const { filterObject } = require('../../util/Util.js');
const moment = require('moment');
require('moment-duration-format');

class Song {
  constructor(song, options) {
    Object.assign(this, song);
    this.member = options.member;
    this.volume = options.volume;
    this.dispatcher = null;
  }

  play(connection, options) {
    this.dispatcher = connection.playStream(this.stream, options);
    return this.dispatcher;
  }

  toString() { return this.title; }

  toJSON() {
    return filterObject(this, ['id', 'title', 'thumbnail', 'stream', 'duration', 'url']);
  }

  get durationString() { return Song.format(this.duration); }
  get linkString() { return `[${this.title}](${this.url}) (${this.durationString})`; }

  get time() {
    const total = Song.format(this.duration);
    const current = Song.format(this.dispatcher.time);
    const left = Song.format(this.duration - this.dispatcher.time + 1000);

    return `${current} / ${total}  |  ${left} left`;
  }

  static format(time) {
    const duration = moment.duration(time);
    if (duration.minutes() > 0) return duration.format('hh:mm:ss');
    return `00:${duration.format('ss')}`;
  }
}

module.exports = Song;
