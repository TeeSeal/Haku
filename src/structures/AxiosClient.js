const axios = require('axios');
const { version } = require('../../package.json');

class AxiosClient {
  constructor(options) {
    const headers = Object.assign(
      { 'User-Agent': `Haku bot v${version} (https://github.com/TeeSeal/Haku)` },
      options.headers
    );

    this.axios = axios.create({
      baseURL: options.baseURL,
      timeout: 5e3,
      headers
    });

    this.defaultParams = options.defaultParams || {};
  }

  request(options) {
    options.params = Object.assign({}, this.defaultParams, options.params || {});
    return this.axios.request(options);
  }

  get(url, params) {
    return this.request({ url, params });
  }
}

module.exports = AxiosClient;
