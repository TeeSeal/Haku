const Song = require('./Song.js')
const Collection = require('../Collection.js')
const Playlist = require('./Playlist.js')

// keep YouTube as the last element
const providers = {
  soundcloud: {
    Provider: require('./SoundCloud.js'),
    keychainKey: 'soundCloudClientID'
  },
  youtube: {
    Provider: require('./YouTube.js'),
    keychainKey: 'googleAPIKey'
  }
}

class MusicHandler {
  constructor(keychain) {
    this.providers = new Collection(
      Object.entries(providers).map(([name, options]) => {
        return [name, new options.Provider(keychain[options.keychainKey])]
      })
    )
    this.playlists = new Map()
  }

  resolveSongs(queries, options) {
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
        })

        const songs = await provider.resolveResource(query)

        if (!songs || songs.length === 0) return []
        return songs.map(song => new Song(song, options))
      })
    ).then(arr => arr.reduce((a1, a2) => a1.concat(a2), []))
  }

  getPlaylist(msg, options) {
    if (this.playlists.has(msg.guild.id)) return this.playlists.get(msg.guild.id)

    const playlist = new Playlist(msg, options, this)
    this.playlists.set(msg.guild.id, playlist)
    return playlist
  }
}

module.exports = MusicHandler
