const Color = require('./Color.js');
const { stripIndents } = require('common-tags');
const paginate = require('./paginate.js');

function buildEmbed(obj) { // eslint-disable-line
  const result = { embed: {} };
  if (obj.icon) obj.thumbnail = `src/assets/icons/${obj.icon}.png`;

  result.files = [obj.thumbnail, obj.image]
    .filter(image => image && !image.startsWith('http'))
    .map(image => { return { attachment: image }; });

  for (const image of ['thumbnail', 'image']) {
    if (!obj[image]) continue;
    result.embed[image] = obj[image].startsWith('http')
      ? { url: obj[image] }
      : { url: `attachment://${obj[image].split('/').slice(-1)[0]}` };
  }

  if (obj.author) {
    result.embed.author = {
      name: obj.author.displayName,
      icon_url: obj.author.user.displayAvatarURL() // eslint-disable-line
    };
  }

  if (obj.color) {
    result.embed.color = Color[obj.color.toUpperCase()];
  }

  result.embed.fields = parseFields(obj.fields);
  result.embed.description = obj.content || '';

  if (obj.paginate) {
    const options = obj.paginate;
    const paginated = paginate(options.items, options.by);

    let page = options.page || 1;
    if (page < 1) page = 1;
    if (page > paginated.length) page = paginated.length;

    if (paginated.length !== 0) {
      if (Array.isArray(options.items[0])) {
        result.embed.fields = result.embed.fields.concat(parseFields(paginated[page - 1]));
      } else {
        result.embed.description = result.embed.description.concat(`\n${paginated[page - 1].join('\n')}`);
      }
    }

    if (paginated.length > 1) {
      result.embed.description = result.embed.description.concat(stripIndents`\n
      **Page: ${page}/${paginated.length}**ç
      Use: \`${options.commandName} page=<integer>\` to view another page.
    `);
    }
  }

  if (obj.footer) {
    if (typeof obj.footer === 'string') result.embed.footer = { text: obj.footer };
    else result.embed.footer = obj.footer;
  }

  if (obj.title) result.embed.title = obj.title;
  if (obj.timestamp) result.embed.timestamp = obj.timestamp;
  if (obj.url) result.embed.url = obj.url;

  return result;
}

function parseFields(fields) {
  if (!fields) return [];
  return fields.map(field => {
    return {
      name: field[0],
      value: field[1],
      inline: field[2]
    };
  });
}

module.exports = buildEmbed;
