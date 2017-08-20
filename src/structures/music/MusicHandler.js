const Song = require('./Song.js');

// keep YouTube as the last element
const providers = [
  require('./SoundCloud.js'),
  require('./YouTube.js')
];


class MusicHandler {
  constructor() {
    throw new Error('this class may not be instantiated.');
  }

  static async resolveSongs(query, options) {
    const provider = providers.find(p => p.REGEXP.test(query));
    const songs = await provider.resolveResource(query);

    if (!songs || songs.length === 0) return null;
    return songs.map(song => new Song(song, options));
  }
}

module.exports = MusicHandler;
