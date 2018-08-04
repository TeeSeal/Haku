const HTTPClient = require('../../HTTPClient')
const Anime = require('./Anime')

class Kitsu extends HTTPClient {
  constructor () {
    super({
      baseURL: 'https://kitsu.io/api/edge/',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    })
  }

  search (query) {
    return this.get('anime', { 'filter[text]': query }).then(res => res.data[0])
  }

  getByID (id) {
    return this.get(`anime/${id}`).then(res => res.data)
  }

  getGenres (id) {
    return this.get(`anime/${id}/genres`).then(res => res.data)
  }

  async resolve (string) {
    const result = /^\d+$/.test(string)
      ? await this.getByID(string)
      : await this.search(string)

    if (!result) return null

    const genres = await this.getGenres(result.id)
    if (genres) {
      result.attributes.genres = genres.map(genre => {
        return genre.attributes.name
      })
    }

    return new Anime(result)
  }
}

module.exports = new Kitsu()
