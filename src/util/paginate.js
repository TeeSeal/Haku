const { pageItemCount } = require('../../config.json');

module.exports = function paginate(arr, itemsCountOverride) {
  const array = arr.slice(0);
  const result = [];
  while (array[0]) result.push(array.splice(0, itemsCountOverride || pageItemCount));
  return result;
}
;