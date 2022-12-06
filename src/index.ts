import { DATABASE, PORT } from './config.js'
import { setupServer } from './server.js'
import pg from 'pg'

const setup = setupServer()
setup.get('/item', async () => {
  const db = new pg.Client(DATABASE)
  await db.connect()
  const rs = await db.query('SELECT * FROM "items"')
  const result = rs.rows
  await db.end()
  return result
})

const server = setup.finalize()
server.listenAtPort(parseInt(PORT ?? '80') ?? 80)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${PORT}\x1B[0m\n\n`)

export function close() {
  server.stopListening()
}
