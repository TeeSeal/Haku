const { Command } = require('discord-akairo')
const { capitalize } = require('../../util')
const Embed = require('../../structures/HakuEmbed')
const Kitsu = require('../../structures/api/kitsu/Kitsu')

class AnimeCommand extends Command {
  constructor () {
    super('anime', {
      aliases: ['anime'],
      args: [
        {
          id: 'query',
          type: 'lowercase',
          match: 'rest'
        }
      ],
      description: 'Search kitsu.io for details on an anime.'
    })
  }

  async exec (msg, args) {
    const { query } = args
    if (!query) return msg.util.error('please specify a name.')

    const anime = await Kitsu.resolve(query)
    if (!anime) return msg.util.error("couldn't find anime.")

    return new Embed(msg.channel)
      .setTitle(`${anime.title} (${anime.japaneseTitle})`)
      .setURL(anime.url)
      .addField('Type', capitalize(anime.type), true)
      .addField('Rating', '⭐'.repeat(anime.rating) || anime.rating, true)
      .addField('Genres', anime.genres.join(', '))
      .addField('Episodes', anime.episodeCount, true)
      .addField('Age Rating', anime.ageRatingString, true)
      .addField('Start Date', anime.startDate, true)
      .addField(...anime.optionalField)
      .addField('Trailer', anime.trailer)
      .setDescription(anime.synopsis)
      .setThumbnail(anime.poster)
      .setColor(Embed.colors.ORANGE)
      .setAuthor(msg.member)
      .send()
  }
}

module.exports = AnimeCommand
