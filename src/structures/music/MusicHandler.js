const Song = require('./Song.js')
const Playlist = require('./Playlist.js')
const MusicProvider = require('./MusicProvider.js')
const { defaultMusicProvider } = require('../../../config.json')

class MusicHandler {
  constructor(keychain) {
    this.providers = MusicProvider.loadAll(keychain)
    this.playlists = new Map()
  }

  resolveSongs(queries, opts) {
    return Promise.all(
      queries.map(async query => {
        const provider = this.providers.find(prov => {
          if (query.includes('~')) {
            const alias = query.split(' ').find(word => word.startsWith('~'))

            if (prov.aliases.includes(alias.slice(1))) {
              const words = query.split(' ')
              words.splice(words.indexOf(alias), 1)
              query = words.join(' ')
              return true
            }
          }

          return prov.REGEXP.test(query)
        }) || this.providers.get(defaultMusicProvider)

        const songs = await provider.resolveResource(query)

        if (!songs || songs.length === 0) return []
        return songs.map(song => new Song(song, opts))
      })
    ).then(arr => arr.reduce((a1, a2) => a1.concat(a2), []))
  }

  getPlaylist(msg, opts) {
    if (this.playlists.has(msg.guild.id)) return this.playlists.get(msg.guild.id)

    const playlist = new Playlist(msg, opts, this)
    this.playlists.set(msg.guild.id, playlist)
    return playlist
  }
}

module.exports = MusicHandler
