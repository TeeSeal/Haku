const tyx = require('tyx');
const url = require('url');
const { version } = require('../../package.json');

class HTTPClient {
  constructor(options) {
    this.headers = Object.assign(
      { 'User-Agent': `Haku bot v${version} (https://github.com/TeeSeal/Haku)` },
      options.headers
    );

    this.baseURL = options.baseURL;
    this.defaultParams = options.defaultParams || {};
  }

  get(endpoint, parameters) {
    const params = Object.assign({}, this.defaultParams, parameters || {});
    return tyx.get(url.resolve(this.baseURL, endpoint), { headers: this.headers, params });
  }
}

module.exports = HTTPClient;
