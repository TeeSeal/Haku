const axios = require('axios');
const moment = require('moment');
const ytdl = require('ytdl-core');
const key = require('../../../config.json').googleAPIKey;

class YouTube {
  constructor() {
    throw new Error('this class may not be instantiated.');
  }

  static formatSong(video) {
    const duration = moment.duration(video.contentDetails.duration, moment.ISO_8601).asSeconds();
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    return {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      duration,
      url
    };
  }

  static request(endpoint, params) {
    params.key = key;
    return axios.get(`https://www.googleapis.com/youtube/v3/${endpoint}`, { params });
  }

  static getByID(id) {
    return YouTube.request(`videos`, {
      id,
      fields: 'items(id, snippet(title, thumbnails(high(url))), contentDetails(duration))',
      part: 'snippet,contentDetails'
    });
  }

  static search(query) {
    return YouTube.request('search', {
      q: query,
      maxResults: 1,
      part: 'id',
      type: 'video'
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

    const video = await YouTube.getByID(query).then(result => result.data.items[0]);
    return [await YouTube.attachStream(YouTube.formatSong(video))];
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
    }).then(result => result.data.items);

    if (!playlistItems) return null;

    const id = playlistItems.map(video => video.contentDetails.videoId).join();
    const videos = await YouTube.getByID(id).then(result => result.data.items);

    return Promise.all(videos.map(video => {
      return YouTube.attachStream(YouTube.formatSong(video));
    }));
  }

  static resolveResource(query) {
    if (query.includes('/playlist?') || /^[a-zA-Z0-9-_]{12,}$/.test(query)) {
      return YouTube.resolvePlaylist(query);
    }

    return YouTube.resolveVideo(query);
  }

  static attachStream(song) {
    return new Promise(resolve => {
      const stream = ytdl(song.url);

      stream.once('response', () => {
        song.stream = stream;
        resolve(song);
      });

      stream.once('error', () => {
        song.stream = null;
        resolve(song);
      });
    });
  }

  static extractVideoID(url) {
    return url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/)[2];
  }

  static extractPlaylistID(url) {
    return url.match(/list=([\w\-_]+)/)[1];
  }

  static get REGEXP() { return /./; }
}

module.exports = YouTube;
