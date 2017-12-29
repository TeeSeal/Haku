const { Command } = require('discord-akairo')
const { buildEmbed, capitalize } = require('../../util/Util')
const Kitsu = require('../../structures/api/kitsu/Kitsu')

class AnimeCommand extends Command {
  constructor() {
    super('anime', {
      aliases: ['anime'],
      args: [
        {
          id: 'query',
          type: 'lowercase',
          match: 'rest',
        },
      ],
      description: 'Search kitsu.io for details on an anime.',
    })
  }

  async exec(msg, args) {
    const { query } = args
    if (!query) return msg.util.error('please specify a name.')

    const anime = await Kitsu.resolve(query)
    if (!anime) return msg.util.error('couldn\'t find anime.')

    const formattedSynopsis = anime.synopsis.length > 1550
      ? anime.synopsis.slice(0, 1500).concat('...')
      : anime.synopsis

    return msg.util.send(buildEmbed({
      title: `${anime.title} (${anime.japaneseTitle})`,
      url: anime.url,
      fields: [
        ['Type', capitalize(anime.type), true],
        ['Rating', '⭐'.repeat(anime.rating) || anime.rating, true],
        ['Genres', anime.genres.join(', ')],
        ['Episodes', anime.episodeCount, true],
        ['Age Rating', anime.ageRatingString, true],
        ['Start Date', anime.startDate, true],
        anime.optionalField,
        ['Trailer', anime.trailer],
      ],
      description: formattedSynopsis,
      thumbnail: anime.poster,
      color: 'orange',
    }))
  }
}

module.exports = AnimeCommand
