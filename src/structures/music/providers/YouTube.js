const MusicProvider = require('../MusicProvider.js')
const moment = require('moment')
const ytdl = require('ytdl-core')

class YouTube extends MusicProvider {
  constructor(key) {
    super({
      baseURL: 'https://www.googleapis.com/youtube/v3/',
      defaultParams: { key },
    })

    this.aliases = ['youtube', 'yt', 'tube']
    this.REGEXP = /(https?:\/\/)?(www\.)?youtu(be\.com|\.be)\//
  }

  formatSong(video) {
    const duration = moment.duration(video.contentDetails.duration).asMilliseconds()
    const url = `https://www.youtube.com/watch?v=${video.id}`
    return {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.maxres
        ? video.snippet.thumbnails.maxres.url
        : video.snippet.thumbnails.high.url,
      duration,
      url,
    }
  }

  getByID(id) {
    return this.get(`videos`, {
      id,
      fields: 'items(id, snippet(title, thumbnails(maxres(url), high(url))), contentDetails(duration))',
      part: 'snippet,contentDetails',
    })
  }

  getPlaylistItems(playlistId) {
    return this.get('playlistItems', {
      playlistId,
      maxResults: 50,
      fields: 'items(contentDetails(videoId))',
      part: 'contentDetails',
    })
  }

  search(query) {
    return this.get('search', {
      q: query,
      maxResults: 1,
      part: 'id',
      type: 'video',
    })
  }

  async resolveVideo(query) {
    if (/^(https?:\/\/)?(www\.)?youtu\.?be(\.com)?\/.+$/.test(query)) {
      query = YouTube.extractVideoID(query)
    }

    if (!/^[a-zA-Z0-9-_]{11}$/.test(query)) {
      query = await this.search(query)
        .then(res => res.items[0] ? res.items[0].id.videoId : null)
    }
    if (!query) return null

    const video = await this.getByID(query).then(result => result.items[0])
    return [await YouTube.attachStream(this.formatSong(video))]
  }

  async resolvePlaylist(query) {
    if (query.includes('/playlist?')) {
      query = YouTube.extractPlaylistID(query)
    }

    const playlistItems = await this.getPlaylistItems(query)
      .then(res => res.items)
      .catch(() => null)
    if (!playlistItems) return null

    const id = playlistItems.map(video => video.contentDetails.videoId).join()
    const videos = await this.getByID(id).then(result => result.items)

    return Promise.all(videos.map(video => {
      return YouTube.attachStream(this.formatSong(video))
    }))
  }

  async resolveResource(query) {
    if (query.includes('/playlist?') || /^[a-zA-Z0-9-_]{12,}$/.test(query)) {
      const result = await this.resolvePlaylist(query)
      if (result) return result
    }

    return this.resolveVideo(query)
  }

  static attachStream(song) {
    return new Promise(resolve => {
      const stream = ytdl(song.url, { filter: 'audioonly' })
        .once('response', () => {
          song.stream = stream
          stream.removeAllListeners('error')
          resolve(song)
        })
        .once('error', () => {
          song.stream = null
          stream.removeAllListeners('response')
          resolve(song)
        })
    })
  }

  static extractVideoID(url) {
    return url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/)[2]
  }

  static extractPlaylistID(url) {
    return url.match(/list=([\w\-_]+)/)[1]
  }

  static get keychainKey() { return 'googleAPIKey' }
}

module.exports = YouTube