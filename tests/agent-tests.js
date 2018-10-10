'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let id = 1
let uuid = 'yyy-yyy-yyy'
let db = null
let single = Object.assign({}, agentFixtures.single)
// se anula la funcion logging mediante defaults
let config = {
  logging: function () {}
}

let uuidArgs = {
  where:{
    uuid
  }
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
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Modol findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single,uuidArgs).returns(Promise.resolve(single))

  // Model findById Stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))


  const setupDataBase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDataBase(config)
})

test.afterEach(() => {
  // si sandbox tiene valor vuelve a crear y lo asigna
  sandbox && sinon.createSandbox()
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

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findByID should be called with specified id  ')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#creteOrUpdate - exist', async t => {
  let agent = await db.Agent.createOrUpdate(single)
  t.deepEqual(agent, single, 'Agent should be the same')
  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

})
