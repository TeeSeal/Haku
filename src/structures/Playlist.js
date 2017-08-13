const playlists = new Map();

class Playlist {
  constructor(msg, guild) {
    this.maxSongDuration = guild.maxSongDuration * 60;
    this.songLimit = guild.songLimit;
    this.queue = [];
    this.channel = msg.channel;
    this.id = this.channel.guild.id;
    this.voiceChannel = msg.member.voiceChannel;
    this.song = null;
    this.connection = null;
    this.defaultVolume = this.convert(guild.defaultVolume) || 0.50;
    this._volume = this.defaultVolume;
    this.paused = false;
    playlists.set(this.id, this);
  }

  connectAndPlay() {
    this.voiceChannel.join().then(connection => {
      this.connection = connection;
      this.play(this.queue.shift());
    });
  }

  filter(songs) {
    const removed = [];
    const filtered = songs.filter(song => {
      // if (song.member.id === song.member.client.ownerID) return true;
      if (song.duration > this.maxSongDuration) {
        removed.push({ song, reason: `duration. (max. ${this.maxSongDuration / 60}min)` });
        return false;
      }
      return true;
    });

    const diff = this.queue.length + filtered.length - this.songLimit;
    if (diff > 0) {
      for (const song of filtered.splice(filtered.length - diff, diff)) {
        removed.push({ song, reason: `playlist song limit reached. (max. ${this.songLimit} songs)` });
      }
    }

    return [filtered, removed];
  }

  play(song) {
    if (!song) {
      this.channel.send({
        files: [{ attachment: 'src/assets/icons/clear.png' }],
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

    this.song = song;
    this._volume = this.convert(song.volume) || this.defaultVolume;
    this.channel.send({
      files: [{ attachment: 'src/assets/icons/play.png' }],
      embed: {
        title: song.title,
        url: song.url,
        color: 5025610,
        thumbnail: { url: 'attachment://play.png' },
        fields: [
          {
            name: 'Now playing.',
            value: `Duration: ${song.durationString} | Volume: ${this.volume}%`
          }
        ],
        author: {
          name: song.member.displayName,
          icon_url: song.member.user.avatarURL // eslint-disable-line
        }
      }
    });

    song.play(this.connection, { volume: this._volume })
      .on('end', () => setTimeout(() => this.play(this.queue.shift()), 10));
  }

  add(songs) {
    const [filtered, removed] = this.filter(songs);
    this.queue = this.queue.concat(filtered);
    if (!this.song) {
      if (filtered.length !== 0) this.connectAndPlay();
      else this.destroy();
    }
    return [filtered, removed];
  }

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

  setVolume(volume) {
    this._volume = this.convert(volume);
    this.song.dispatcher.setVolume(this._volume);
  }

  fadeVolume(volume) {
    let current = this._volume;
    this._volume = this.convert(volume);
    const modifier = current < this._volume ? 0.05 : -0.05;

    return new Promise(resolve => {
      const interval = setInterval(() => {
        current += modifier;
        this.song.dispatcher.setVolume(current);

        if (current > (this._volume - 0.05) && current < (this._volume + 0.05)) {
          this.song.dispatcher.setVolume(this._volume);
          clearInterval(interval);
          setTimeout(resolve, 400);
        }
      }, 35);
    });
  }

  destroy() {
    this.queue = [];
    this.voiceChannel.leave();
    playlists.delete(this.id);
  }

  convert(volume) { return volume / 50; }
  get volume() { return this._volume * 50; }
  static get(id) { return playlists.get(id); }
  static has(id) { return playlists.has(id); }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

module.exports = Playlist;
