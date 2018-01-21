const { extend, setDefaults } = require('../CollectionModel')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      inventory: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      hooks: {
        afterSync: setDefaults,
      },
    }
  )

  return extend(User, 6e5)
}
