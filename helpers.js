const tags = require('common-tags');
const { pageItemCount } = require('./config.json');

const helpers = {
  db: require('./rethinkdb/rethinkdb.js'),
  youtube: require('./util/youtube.js'),
  Playlist: require('./structures/Playlist.js'),
  Song: require('./structures/Song.js'),
  paginate(arr) {
    const array = arr.slice(0);
    const result = [];
    while (array[0]) result.push(array.splice(0, pageItemCount));
    return result;
  }
};

Object.assign(helpers, tags);
module.exports = helpers;
