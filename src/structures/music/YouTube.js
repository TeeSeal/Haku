const axios = require('axios');
const moment = require('moment');
const key = require('../../../config.json').googleAPI;

const fields = {
  video: 'items(id, snippet(title, thumbnails(high(url))), contentDetails(duration))',
  playlist: 'items(id, snippet(title))'
};

const format = {
  video(video) {
    const duration = moment.duration(video.contentDetails.duration, moment.ISO_8601).asSeconds();
    return {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      duration
    };
  },
  playlist(playlist) {
    return {
      id: playlist.id,
      title: playlist.snippet.title
    };
  }
};

class YouTube {
  constructor() {
    throw new Error('this class may not be instantiated.');
  }

  static request(endpoint, params) {
    params.key = key;
    return axios.get(`https://www.googleapis.com/youtube/v3/${endpoint}`, { params });
  }

  static getByID(id, type = 'video') {
    return YouTube.request(`${type}s`, {
      id,
      fields: fields[type],
      part: `snippet${type === 'video' ? ',contentDetails' : ''}`
    });
  }

  static search(query, type = 'video') {
    return YouTube.request('search', {
      q: query,
      maxResults: 1,
      part: 'id',
      type: type
    });
  }

  static async resolveVideo(query) {
    if (/^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(query)) {
      query = YouTube.extractVideoID(query);
    }

    if (!/[a-zA-Z0-9-_]{11}$/.test(query)) {
      query = await YouTube.search(query)
        .then(res => res.data.items[0].id.videoId);
    }

    const video = await YouTube.getByID(query);
    return [format.video(video.data.items[0])];
  }

  static async resolvePlaylist(query) {
    if (query.includes('/playlist?')) {
      query = YouTube.extractPlaylistID(query);
    }

    const playlistItems = await YouTube.request('playlistItems', {
      playlistId: query,
      maxResults: 50,
      fields: 'items(contentDetails(videoId))',
      part: 'contentDetails'
    });

    if (!playlistItems.data.items) return [];

    const id = playlistItems.data.items.map(video => video.contentDetails.videoId).join();
    const videos = await YouTube.getByID(id);

    return videos.data.items.map(video => format.video(video));
  }

  static resolveResource(query) {
    if (query.includes('/playlist?') || /^[a-zA-Z0-9-_]{12,}$/.test(query)) {
      return YouTube.resolvePlaylist(query);
    }

    return YouTube.resolveVideo(query);
  }

  static extractVideoID(url) {
    return url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/)[2];
  }

  static extractPlaylistID(url) {
    return url.match(/list=([\w\-_]+)/)[1];
  }

  static makeURL(id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }
}

module.exports = YouTube;
