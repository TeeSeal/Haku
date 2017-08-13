const tags = require('common-tags');
const path = require('path');
const { pageItemCount } = require('../../config.json');

const util = {
  YouTube: require('./YouTube.js'),
  Color: require('./Color.js'),
  buildEmbed: require('./buildEmbed.js'),
  rootDir: __dirname.split(path.sep).slice(0, -1).join(path.sep),
  paginate(arr, amount) {
    const array = arr.slice(0);
    const result = [];
    while (array[0]) result.push(array.splice(0, amount || pageItemCount));
    return result;
  },
  capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
  },
  getDBData(msg, scope) {
    return scope === 'globally'
      ? ['client', 'haku', scope]
      : [`${scope}s`, msg[scope].id, `in this ${scope}`];
  }
};

Object.assign(util, tags);
module.exports = util;
