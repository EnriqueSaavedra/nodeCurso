'use strict'

const Sequelize = require('sequelize')
const SetupDataBase = require('../lib/db')

module.exports = function setupMetrictModel (config) {
  const sequelize = SetupDataBase(config)

  return sequelize.define('metric', {
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  })
}
