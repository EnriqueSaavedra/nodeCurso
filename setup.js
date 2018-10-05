'use strict'

const debug = require('debug')('platziverse:db:setup')
const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')

const promp = inquirer.createPromptModule()

async function setup () {
  // entrada de teclado, con await espera la respuesta
  const answer = await promp({
    type: 'confirm',
    name: 'setup',
    message: 'This will destroy your database, are you sure?'
  })

  if (!answer.setup) {
    return console.log('Nothing happened :)')
  }

  // $env:DB_PASS=‘foo’ ; npm run setup
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Succcess!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
