const Sequelize = require('sequelize');
const { prefix } = require('../../config.json');

module.exports = {
  client: {
    schema: {
      id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: []
      }
    },
    cacheOnInit: true
  },

  guilds: {
    schema: {
      id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
      },
      prefix: {
        type: Sequelize.STRING,
        defaultValue: prefix
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      defaultVolume: {
        type: Sequelize.INTEGER,
        defaultValue: 25
      },
      maxVolume: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      maxSongDuration: {
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      songLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      }
    },
    cacheOnInit: true
  },

  channels: {
    schema: {
      id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
      },
      blacklist: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      disabled: {
        type: Sequelize.JSON,
        defaultValue: []
      }
    },
    cacheOnInit: true
  },

  users: {
    schema: {
      id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
      },
      inventory: {
        type: Sequelize.JSON,
        defaultValue: {}
      }
    },
    cacheTimeout: 1e4
  }
};
