const axios = require('axios');
const moment = require('moment');
const key = require('../../config.json').googleAPI;
const api = 'https://www.googleapis.com/youtube/v3/';

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

module.exports = {
  async getPlaylistItems(playlistId) {
    const result = await axios.get(`${api}playlistItems`, {
      params: {
        playlistId,
        key,
        maxResults: 50,
        fields: 'items(contentDetails(videoId))',
        part: `contentDetails`
      }
    });

    const id = result.data.items.map(video => video.contentDetails.videoId).join();
    return getById(id).then(res => res.data.items.map(video => format.video(video)));
  },
  async findVideo(query) {
    if (/^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(query)) {
      const result = await getById(extractId(query));
      return format.video(result.data.items[0]);
    }

    if (/^[\w\-_]{11}$/.test(query)) {
      const result = await getById(query);
      if (result.data.items) return format.video(result.data.items[0]);
    }

    const id = await search(query);
    const res = await getById(id);
    return format.video(res.data.items[0]);
  },
  async getVideos(query) {
    if (/playlist/.test(query)) return this.getPlaylistItems(extractId(query));

    if (/^[\w\-_]{34}$/.test(query)) {
      const result = await getById(query, 'playlist');
      if (result.data.items) return this.getPlaylistItems(query);
    }

    return [await this.findVideo(query)];
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
