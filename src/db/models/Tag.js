const { extend, setDefaults } = require('../CollectionModel')

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: []
      }
    },
    {
      hooks: {
        afterSync: setDefaults
      }
    }
  )

  return extend(Tag, 6e5)
}
