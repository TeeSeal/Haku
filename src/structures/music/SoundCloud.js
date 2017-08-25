const AxiosClient = require('../AxiosClient');

class SoundCloud extends AxiosClient {
  constructor(clientID) {
    super({
      baseURL: 'https://api.soundcloud.com/',
      defaultParams: { client_id: clientID } // eslint-disable-line
    });

    this.clientID = clientID;
    this.aliases = ['soundcloud', 'sc'];
    this.REGEXP = /^https:\/\/soundcloud\.com\//;
  }

  formatSong(track) {
    return {
      id: track.id,
      title: track.title,
      thumbnail: track.artwork_url,
      stream: `${track.stream_url}?client_id=${this.clientID}`,
      duration: track.duration,
      url: track.permalink_url
    };
  }

  async resolveResource(query) {
    if (this.REGEXP.test(query)) {
      const resource = await this.get('resolve.json', { url: query }).then(result => result.data);
      if (!resource) return null;
      if (!['track', 'playlist'].some(kind => resource.kind === kind)) return null;

      return resource.kind === 'track'
        ? [this.formatSong(resource)]
        : resource.tracks.map(track => this.formatSong(track));
    }

    const track = await this.get('tracks', { q: query }).then(result => result.data[0]);
    if (!track) return null;

    return [this.formatSong(track)];
  }
}


module.exports = SoundCloud;
