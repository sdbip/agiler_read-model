import { PORT } from './config.js'
import { NOT_FOUND, setupServer } from './server.js'
import { PGDatabase } from './pg-database.js'
import { Database } from './database.js'

let database: Database = new PGDatabase()

const setup = setupServer()
setup.get('/item', async (request) => {
  const type = (request.query.type as string)?.split('|')
  return database.itemsWithSpecification({ progress: 'notStarted', parent: null, type })
})

setup.get('/item/:id', async (request) => {
  const id = request.params.id
  return await database.item(id) ?? NOT_FOUND
})

setup.get('/item/:id/child', async (request) => {
  const id = request.params.id
  const type = (request.query.type as string)?.split('|')
  return database.itemsWithSpecification({ progress: 'notStarted', parent: id, type })
})

const server = setup.finalize()
const port = parseInt(PORT ?? '80') ?? 80
server.listenAtPort(port)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${port}\x1B[0m\n\n`)

export function start(testDatabase: Database) {
  database = testDatabase
  server.stopListening()
  server.listenAtPort(port)
}

export function stop() {
  server.stopListening()
}
