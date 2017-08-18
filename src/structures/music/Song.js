const ytdl = require('ytdl-core');

class Song {
  constructor(video, options) {
    Object.assign(this, video);
    this.member = options.member;
    this.volume = options.volume;
    this.dispatcher = null;
  }

  play(connection, options) {
    this.dispatcher = connection.playStream(ytdl(this.url, { filter: 'audioonly' }), options);
    return this.dispatcher;
  }

  toString() { return this.title; }

  get plain() {
    return {
      id: this.id,
      title: this.title,
      duration: this.duration,
      host: this.host
    };
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
