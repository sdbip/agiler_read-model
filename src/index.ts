import { PORT } from './config.js'
import { setupServer } from './server.js'
import { Database, PGDatabase } from './pg-database.js'
import { NOTFOUND } from 'dns'

let database: Database = new PGDatabase()

const setup = setupServer()
setup.get('/item', async (request) => {
  const type = (request.query.type as string)?.split('|')
  return database.itemsWithSpecification({ progress: 'notStarted', parent: null, type })
})

setup.get('/item/:id', async (request) => {
  const id = request.params.id
  return await database.item(id) ?? NOTFOUND
})

setup.get('/item/:id/child', async (request) => {
  const id = request.params.id
  const type = (request.query.type as string)?.split('|')
  return database.itemsWithSpecification({ progress: 'notStarted', parent: id, type })
})

const server = setup.finalize()
server.listenAtPort(parseInt(PORT ?? '80') ?? 80)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${PORT ?? '80'}\x1B[0m\n\n`)

export function start(testDatabase: Database) {
  database = testDatabase
  server.stopListening()
  server.listenAtPort(parseInt(PORT ?? '80') ?? 80)
}

export function stop() {
  server.stopListening()
}
