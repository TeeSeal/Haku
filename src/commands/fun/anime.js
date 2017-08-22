const { Command } = require('discord-akairo');
const { buildEmbed, capitalize } = require('../../util/Util.js');
const Kitsu = require('../../structures/api/kitsu/Kitsu.js');

async function exec(msg, args) {
  const { query } = args;
  if (!query) return msg.util.error('please specify a name.');

  const anime = await Kitsu.resolve(query);
  if (!anime) return msg.util.error('couldn\'t find anime.');

  const formattedSynopsis = anime.synopsis.length > 1550
    ? anime.synopsis.slice(0, 1500).concat('...')
    : anime.synopsis;

  return msg.util.send(buildEmbed({
    title: `${anime.title} (${anime.japaneseTitle})`,
    url: anime.url,
    fields: [
      ['Type', capitalize(anime.type), true],
      ['Rating', '⭐'.repeat(anime.rating), true],
      ['Genres', anime.genres.join(', ')],
      ['Episodes', anime.episodeCount, true],
      ['Age Rating', anime.ageRating, true],
      ['Start Date', anime.startDate, true],
      ['End Date', anime.endDate, true],
      ['Trailer', anime.trailer]
    ],
    content: formattedSynopsis,
    thumbnail: anime.poster,
    color: 'orange'
  }));
}

module.exports = new Command('anime', exec, {
  aliases: ['anime'],
  args: [
    {
      id: 'query',
      type: 'lowercase',
      match: 'rest'
    }
  ],
  description: 'Search kitsu.io for details on an anime.'
});
