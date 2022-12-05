import { assert } from 'chai'
import { promises as fs } from 'fs'
import http from 'http'
import pg from 'pg'
import { DATABASE, PORT } from '../src/config'
import { close } from '../src/index'

describe('GET /', () => {

  before(async () => {
    const data = await fs.readFile('./test/items.sql')
    const schemaSQL = data.toString('utf-8')
    
    const client = new pg.Client({ database: DATABASE })
    await client.connect()
    await client.query(schemaSQL)
    await client.end()
  })

  after(() => {
    close()
  })

  it('can retrieve all items', async () => {
    const response = await get(`http://localhost:${PORT}`)

//    assert.equal(response.statusCode, 200)
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

function readResponse(response: http.IncomingMessage): Promise<ResponseData> {
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
