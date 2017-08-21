const Song = require('./Song.js');

// keep YouTube as the last element
const providers = {
  soundCloudClientID: require('./SoundCloud.js'),
  googleAPIKey: require('./YouTube.js')
};

class MusicHandler {
  constructor(keychain) {
    this.providers = Object.entries(providers)
      .map(([key, Provider]) => new Provider(keychain[key]));
  }

  async resolveSongs(query, options) {
    const provider = this.providers.find(p => p.REGEXP.test(query));
    const songs = await provider.resolveResource(query);

    if (!songs || songs.length === 0) return null;
    return songs.map(song => new Song(song, options));
  }
}

module.exports = MusicHandler;
