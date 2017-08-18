const Song = require('./Song.js');

const providers = { youtube: require('./YouTube.js') };

class MusicHandler {
  constructor() {
    throw new Error('this class may not be instantiated.');
  }

  static async resolveSongs(query, options) {
    const provider = Object.keys(providers).find(key => query.includes(key)) || 'youtube';
    const songs = await providers[provider].resolveResource(query);

    if (!songs || songs.length === 0) return null;
    return songs.map(song => new Song(song, options));
  }
}

module.exports = MusicHandler;
