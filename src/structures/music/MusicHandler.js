const Song = require('./Song.js');
const Collection = require('../Collection.js');
const Playlist = require('./Playlist.js');

// keep YouTube as the last element
const providers = {
  soundcloud: {
    Provider: require('./SoundCloud.js'),
    keychainKey: 'soundCloudClientID'
  },
  youtube: {
    Provider: require('./YouTube.js'),
    keychainKey: 'googleAPIKey'
  }
};

class MusicHandler {
  constructor(keychain) {
    this.providers = new Collection(
      Object.entries(providers).map(([name, options]) => {
        return [name, new options.Provider(keychain[options.keychainKey])];
      })
    );
    this.playlists = new Map();
  }

  resolveSongs(queries, options) {
    return Promise.all(
      queries.map(async query => {
        const words = query.split(' ');
        const providerName = words.find(word => {
          return word.startsWith('~') && this.providers.has(word.toLowerCase().slice(1));
        });

        if (providerName) words.splice(words.indexOf(providerName), 1);

        const provider = providerName
          ? this.providers.get(providerName.toLowerCase().slice(1))
          : this.providers.find(p => p.REGEXP.test(words.join(' ')));

        const songs = await provider.resolveResource(words.join(' '));

        if (!songs || songs.length === 0) return [];
        return songs.map(song => new Song(song, options));
      })
    ).then(arr => arr.reduce((a1, a2) => a1.concat(a2), []));
  }

  getPlaylist(msg, options) {
    if (this.playlists.has(msg.guild.id)) return this.playlists.get(msg.guild.id);

    const playlist = new Playlist(msg, options, this);
    this.playlists.set(msg.guild.id, playlist);
    return playlist;
  }
}

module.exports = MusicHandler;
