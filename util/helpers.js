const tags = require('common-tags');
const { pageItemCount } = require('../config.json');

const helpers = {
  db: require('./rethinkdb.js'),
  youtube: require('./youtube.js'),
  paginate(arr, amount) {
    const array = arr.slice(0);
    const result = [];
    while (array[0]) result.push(array.splice(0, amount || pageItemCount));
    return result;
  }
};

Object.assign(helpers, tags);
module.exports = helpers;
