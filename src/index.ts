import { PORT } from './config.js'
import { setupServer } from './server.js'
import { Database, PGDatabase } from './pg-database.js'

let database: Database = new PGDatabase()

const setup = setupServer()
setup.get('/item', async (request) => {
  const type = (request.query.type as string)?.split('|')
  return database.items({ progress: 'notStarted', parent: null, type })
})

const server = setup.finalize()
server.listenAtPort(parseInt(PORT ?? '80') ?? 80)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${PORT ?? '80'}\x1B[0m\n\n`)

export function close() {
  server.stopListening()
}

export function overrideDatabase(testDatabase: Database) {
  database = testDatabase
}
