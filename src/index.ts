import { PORT } from './config.js'
import { setupServer } from './server.js'
import { Database, PGDatabase } from './pg-database.js'

let database: Database = new PGDatabase()

const setup = setupServer()
setup.get('/item', async () => {
  return database.items()
})

const server = setup.finalize()
server.listenAtPort(parseInt(PORT ?? '80') ?? 80)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${PORT ?? '80'}\x1B[0m\n\n`)

export function close() {
  server.stopListening()
}

export function overrideDatabase(testDatabase: PGDatabase) {
  database = testDatabase
}
