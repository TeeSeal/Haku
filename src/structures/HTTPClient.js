const request = require('request');
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

  get(endpoint, params) {
    return new Promise((resolve, reject) => {
      request({
        url: url.resolve(this.baseURL, endpoint),
        qs: Object.assign({}, this.defaultParams, params || {}),
        headers: this.headers
      }, (err, res, body) => {
        if (err) return reject(err);
        if (res.statusCode > 300) return reject(res);
        return resolve(JSON.parse(body));
      });
    });
  }
}

module.exports = HTTPClient;
