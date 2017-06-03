const axios = require('axios');
const moment = require('moment');
const key = require('../config.json').googleAPI;
const api = 'https://www.googleapis.com/youtube/v3/';

const fields = {
  video: 'items(id, snippet(title), contentDetails(duration))',
  playlist: 'items(id, snippet(title))'
};

const format = {
  video(video) {
    const duration = moment.duration(video.contentDetails.duration, moment.ISO_8601).asSeconds();
    return {
      id: video.id,
      title: video.snippet.title,
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

module.exports = {
  async getPlaylistItems(link) {
    const result = await axios.get(`${api}playlistItems`, {
      params: {
        playlistId: extractId(link),
        key,
        maxResults: 50,
        fields: 'items(contentDetails(videoId))',
        part: `contentDetails`
      }
    });

    return Promise.all(result.data.items.map(async video => {
      const res = await getById(video.contentDetails.videoId);
      return format.video(res.data.items[0]);
    }));
  },
  async findVideo(query) {
    if (/^https?:\/\/(www.youtube.com|youtube.com|youtu.be)\//.test(query)) {
      const result = await getById(extractId(query));
      return format.video(result.data.items[0]);
    }

    if (/[\w\-_]{11}/.test(query)) {
      const result = await getById(query);
      if (result.data.items) return format.video(result.data.items[0]);
    }

    const id = await search(query);
    const res = await getById(id);
    return format.video(res.data.items[0]);
  },
  async getVideos(query) {
    return /playlist/.test(query) ? this.getPlaylistItems(query) : [await this.findVideo(query)];
  }
};

function search(q, type = 'video') {
  return axios.get(`${api}search`, {
    params: {
      q,
      key,
      maxResults: 1,
      part: 'id',
      type: type
    }
  }).then(res => res.data.items[0].id.videoId);
}

function getById(id, type = 'video') {
  return axios.get(`${api}${type}s`, {
    params: {
      id,
      key,
      fields: fields[type],
      part: `snippet${type === 'video' ? ',contentDetails' : ''}`
    }
  });
}

function extractId(url) {
  return url.match(
    /^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?.*?(?:v|list)=(.*?)(?:&|$)|^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?(?:(?!=).)*\/(.*)$/
  )[1];
}
