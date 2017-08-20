const { filterObject } = require('../../util/Util.js');

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

  get durationString() { return format(this.duration); }
  get linkString() { return `[${this.title}](${this.url}) (${format(this.duration)})`; }

  get time() {
    const total = format(this.duration);
    const current = format(this.dispatcher.time / 1000);
    const left = format(this.duration - (this.dispatcher.time / 1000));

    return `${current} / ${total}  |  ${left} left`;
  }
}

function format(sec) {
  const hours = leftPad(~~(sec / 3600));
  const minutes = leftPad(~~(sec % 3600 / 60));
  const seconds = leftPad(~~(sec % 3600 % 60));
  return hours === `00` ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
}

function leftPad(num) {
  return num > 9 ? num.toString() : `0${num}`;
}

module.exports = Song;
