'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let id = 1
let db = null
let single = Object.assign({},agentFixtures.single)
// se anula la funcion logging mediante defaults
let config = {
  logging: function () {}
}
// para evitar usar el mismo spy en cada llamada
// beforeEach
let sandbox = null
let AgentStub = null
// sinon.spy() sirve para ver info de las llamadas
let MetricStub = {
  belongsTo: sinon.spy()
}


test.beforeEach(async () => {
  sandbox = sinon.sandbox.create();
  AgentStub = {
    hasMany: sandbox.spy()
  }
  const setupDataBase = proxyquire('../',{
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDataBase(config)

})

test.afterEach(() => {
  // si sandbox tiene valor vuelve a crear y lo asigna
  sandbox && sinon.sandbox.create()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  // verifica si fueron llamadas estas funciones con sinon
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetciModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)
  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})