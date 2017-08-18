const tags = require('common-tags');
const path = require('path');
const { pageItemCount } = require('../../config.json');

const util = {
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
  },
  filterObject(obj, keys) {
    const result = {};
    for (const key of keys) result[key] = obj[key];
    return result;
  },
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }
};

Object.assign(util, tags);
module.exports = util;
