const Color = require('./Color.js');

function buildEmbed(obj) {
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
      icon_url: obj.author.user.displayAvatarURL // eslint-disable-line
    };
  }

  if (obj.color) {
    result.embed.color = Color[obj.color.toUpperCase()];
  }


  if (obj.fields) {
    result.embed.fields = obj.fields.map(field => {
      return {
        name: field[0],
        value: field[1],
        inline: field[2] || false
      };
    });
  }

  if (obj.content) result.embed.description = obj.content;
  if (obj.title) result.embed.title = obj.title;
  if (obj.timestamp) result.embed.timestamp = obj.timestamp;
  if (obj.url) result.embed.url = obj.url;

  return result;
}

module.exports = buildEmbed;
