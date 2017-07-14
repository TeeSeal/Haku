const tags = require('common-tags');
const path = require('path');
const { pageItemCount } = require('../config.json');

const _util = {
  db: require('./rethinkdb.js'),
  youtube: require('./youtube.js'),
  rootDir: __dirname.split(path.sep).slice(0, -1).join(path.sep),
  paginate(arr, amount) {
    const array = arr.slice(0);
    const result = [];
    while (array[0]) result.push(array.splice(0, amount || pageItemCount));
    return result;
  },
  capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
  }
};

Object.assign(_util, tags);
module.exports = _util;
