const AxiosClient = require('../../AxiosClient.js');
const Anime = require('./Anime.js');

class Kitsu extends AxiosClient {
  constructor() {
    super({
      baseURL: 'https://kitsu.io/api/edge/',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });
  }

  search(query) {
    return this.get('anime', { 'filter[text]': query }).then(res => res.data.data[0]);
  }

  getByID(id) {
    return this.get(`anime/${id}`).then(res => res.data.data);
  }

  getGenres(id) {
    return this.get(`anime/${id}/genres`).then(res => res.data.data);
  }

  async resolve(string) {
    const result = /^\d+$/.test(string)
      ? await this.getByID(string)
      : await this.search(string);

    if (!result) return null;
    const genres = await this.getGenres(result.id);

    if (genres) {
      result.attributes.genres = genres.map(genre => {
        return genre.attributes.name;
      });
    }

    return new Anime(result);
  }
}

module.exports = new Kitsu();
