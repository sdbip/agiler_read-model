import express from 'express'
import { json, Request, Response, Router, urlencoded } from 'express'
import { createServer } from 'http'
import { PORT } from './config.js'

const app = express()

app.use(json())
app.use(urlencoded({ extended: false }))

const router = Router()
router.get('/', (_: Request, res: Response) => {
  res.json({ message: 'alive' })
})
app.use('/', router)

const server = createServer(app)
server.listen(PORT)

process.stdout.write(`\x1B[35mListening on port \x1B[30m${PORT}\x1B[0m\n\n`)

export function close() {
    server.close()
}
