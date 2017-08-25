const AxiosClient = require('../AxiosClient');

class SoundCloud extends AxiosClient {
  constructor(clientID) {
    super({
      baseURL: 'https://api.soundcloud.com/',
      defaultParams: { client_id: clientID } // eslint-disable-line
    });
    this.clientID = clientID;
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

  async resolveResource(url) {
    const resource = await this.get('resolve.json', { url }).then(result => result.data);
    if (!['track', 'playlist'].some(kind => resource.kind === kind)) return null;

    return resource.kind === 'track'
      ? [this.formatSong(resource)]
      : resource.tracks.map(track => this.formatSong(track));
  }
}


module.exports = SoundCloud;
