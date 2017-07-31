const Sequelize = require('sequelize');
const { prefix } = require('../../config.json');

module.exports = {
  templates: {
    client: {
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
    users: {
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
    guilds: {
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
      },
      playlists: {
        type: Sequelize.JSON,
        defaultValue: {}
      }
    },
    channels: {
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
    }
  },
  defaults: {
    client: {
      blacklist: [],
      disabled: []
    },
    users: { inventory: {} },
    guilds: {
      prefix,
      blacklist: [],
      disabled: [],
      reps: {},
      defaultVolume: 25,
      maxVolume: 100,
      maxSongDuration: 15,
      songLimit: 100,
      playlists: {}
    },
    channels: {
      blacklist: [],
      disabled: []
    }
  }
};
