const playlists = new Map();

module.exports = class {
  constructor(options = {}) {
    this.queue = options.songs;
    this.channel = options.msg.channel;
    this.id = this.channel.guild.id;
    this.voiceChannel = options.msg.member.voiceChannel;
    this.song = null;
    this.connection = null;
    this._volume = options.volume / 50 || 0.50;
    this.paused = false;
    playlists.set(this.id, this);
    this.connectAndPlay();
  }

  connectAndPlay() {
    this.voiceChannel.join().then(connection => {
      this.connection = connection;
      this.play(this.queue.shift());
    });
  }

  play(song) {
    if (!song) {
      this.channel.send('\u200b', {
        files: [{ attachment: 'assets/icons/clear.png' }],
        embed: {
          color: 16731469,
          fields: [
            {
              name: 'We\'re out of songs.',
              value: 'Better queue up some more!'
            }
          ],
          thumbnail: { url: 'attachment://clear.png' }
        }
      });

      return this.destroy();
    }

    this.channel.send('\u200b', {
      files: [{ attachment: 'assets/icons/play.png' }],
      embed: {
        title: song.title,
        url: song.url,
        color: 5025610,
        thumbnail: { url: 'attachment://play.png' },
        fields: [
          {
            name: 'Now playing.',
            value: `Duration: ${song.durationString}`
          }
        ],
        author: {
          name: song.member.displayName,
          icon_url: song.member.user.avatarURL // eslint-disable-line
        }
      }
    });

    this.song = song;
    song.play(this.connection, { volume: this._volume })
      .on('end', () => setTimeout(() => this.play(this.queue.shift()), 4));
  }

  add(song) { this.queue.push(song); }
  skip() { this.song.dispatcher.end(); }
  shuffle() { this.queue = shuffle(this.queue); }

  pause() {
    this.song.dispatcher.pause();
    this.paused = true;
  }

  resume() {
    this.song.dispatcher.resume();
    this.paused = false;
  }

  setVolume(vol) {
    this._volume = vol / 50;
    this.song.dispatcher.setVolume(this._volume);
  }

  get volume() { return this._volume * 50; }

  destroy() {
    this.queue = [];
    this.voiceChannel.leave();
    playlists.delete(this.id);
  }

  static get(id) { return playlists.get(id); }
  static has(id) { return playlists.has(id); }
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}
