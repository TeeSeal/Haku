const axios = require('axios');
const clientID = require('../../../config.json').soundCloudClientID;

class SoundCloud {
  constructor() {
    throw new Error('this class may not be instantiated');
  }

  static formatSong(track) {
    return {
      id: track.id,
      title: track.title,
      thumbnail: track.artwork_url,
      stream: `${track.stream_url}?client_id=${clientID}`,
      duration: Math.floor(track.duration / 1e3),
      url: track.permalink_url
    };
  }

  static request(endpoint, params) {
    params.client_id = clientID; // eslint-disable-line
    return axios.get(`https://api.soundcloud.com/${endpoint}`, { params });
  }

  static async resolveResource(url) {
    const resource = await SoundCloud.request('resolve.json', { url }).then(result => result.data);
    if (!['track', 'playlist'].some(kind => resource.kind === kind)) return null;

    return resource.kind === 'track'
      ? [SoundCloud.formatSong(resource)]
      : resource.tracks.map(track => SoundCloud.formatSong(track));
  }

  static get REGEXP() { return /^https:\/\/soundcloud\.com\//; }
}


module.exports = SoundCloud;
