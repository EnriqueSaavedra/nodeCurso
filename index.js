'use strict'

const setupDataBase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const defaults = require('defaults')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      query: {
        raw: true
      }
    }
  })

  const sequelize = setupDataBase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // establece relacion entre tablas
  // automaticamente crea las llaves foraneas
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  // la funcion se detiene hasta que se completa la promesa
  await sequelize.authenticate()

  // si la configuracion tiene setup activo
  if (config.setup) {
    // sincronizar base de datos en servicor
    // force:true => si la bd existe borrala y creala
    await sequelize.sync({ force: true })
  }

  // va a crear todos los modelos si no existen
  // sequelize.sync()

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel)

  return {
    Agent,
    Metric
  }
}
