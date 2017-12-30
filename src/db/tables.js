const Sequelize = require('sequelize')
const { prefix } = require('../../config.json')

module.exports = {
  client: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    },
    cacheOnInit: true,
  },

  guilds: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      prefix: {
        type: Sequelize.STRING,
        defaultValue: prefix,
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      defaultVolume: {
        type: Sequelize.INTEGER,
        defaultValue: 25,
      },
      maxVolume: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      maxSongDuration: {
        type: Sequelize.INTEGER,
        defaultValue: 15,
      },
      songLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      eightBall: {
        type: Sequelize.JSON,
        defaultValue: [
          'Yes.',
          'Absolutely.',
          'Most likely.',
          'Without a doubt.',
          'It is certain.',
          'My sources say no.',
          'Nuh-huh.',
          'Very doubtful.',
          'Nah.',
          'My sources say no.',
        ],
      },
    },
    cacheOnInit: true,
  },

  channels: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    },
    cacheOnInit: true,
  },

  users: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      inventory: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
    },
    cacheTimeout: 6e5,
  },

  tags: {
    schema: {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    },
    cacheTimeout: 6e5,
  },
}
