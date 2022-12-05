import { assert } from 'chai'
import { promises as fs } from 'fs'
import http, { IncomingMessage } from 'http'
import pg from 'pg'
import { DATABASE, PORT } from '../src/config'

import express, { json, urlencoded, Router } from 'express'
import { createServer } from 'http'

const app = express()

app.use(json())
app.use(urlencoded({ extended: false }))

const router = Router()
router.get('/', (req: unknown, res: any) => {
  res.json({ message: 'alive', test: process.env.TEST })
})
app.use('/', router)

const port = process.env.PORT ?? 80
const server = createServer(app)


describe('GET /item', () => {

  before(async () => {
    const data = await fs.readFile('./test/items.sql')
    const schemaSQL = data.toString('utf-8')
    
    const client = new pg.Client({ database: DATABASE })
    await client.connect()
    await client.query(schemaSQL)
    await client.end()

    server.listen(port)
  })

  after(() => {
    server.close()
  })

  it('can connect', async () => {
    const response = await get(`http://localhost:${PORT}`)

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.content, { message: 'alive' })
  })
})


function get(url: string) {
  return new Promise<ResponseData>((resolve) => {
    const request = http.get(url, async response => {
      const result = await readResponse(response)
      resolve(result)
    })

    request.end()
  })
}

type ResponseData = {
  statusCode: number
  content: any
}

function readResponse(response: IncomingMessage): Promise<ResponseData> {
  return new Promise((resolve) => {
    let result = ''
    response.setEncoding('utf-8')
    response.on('data', (content) => {
      result += content
    })
    response.on('end', () => {
      resolve({
        statusCode: response.statusCode as number,
        content: JSON.parse(result),
      })
    })
  })
}
