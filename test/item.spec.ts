import { assert } from 'chai'
import { promises as fs } from 'fs'
import http from 'http'
import pg from 'pg'
import { DATABASE_CONNECTION_STRING, PORT } from '../src/config'
import { close } from '../src/index'

describe('Read Model', () => {

  before(async () => {
    const data = await fs.readFile('./test/items.sql')
    const schemaSQL = data.toString('utf-8')

    const client = new pg.Client(DATABASE_CONNECTION_STRING)
    await client.connect()
    await client.query(schemaSQL)
    await client.end()
  })

  after(() => {
    close()
  })

  describe('GET /item', () => {

    it('returns status code 200', async () => {
      const response = await getAll()
      assert.equal(response.statusCode, 200)
    })

    it('returns all items', async () => {
      const response = await getAll()
      assert.deepEqual(response.content, [
        {
          id: 'epic',
          type: 'Epic',
          title: 'Epic Feature',
          progress: 'notStarted',
          parent_id: null,
          assignee: null,
        },
        {
          id: 'mmf',
          type: 'Feature',
          title: 'MMF',
          progress: 'notStarted',
          parent_id: 'epic',
          assignee: null,
        },
        {
          id: 'story',
          type: 'Story',
          title: 'Parent Story',
          progress: 'notStarted',
          parent_id: null,
          assignee: null,
        },
        {
          id: 'subtask',
          type: 'Task',
          title: 'Task',
          progress: 'notStarted',
          parent_id: 'story',
          assignee: null,
        },
      ])
    })

    function getAll() { return get(`http://localhost:${PORT}/item`) }
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
        statusCode: response.statusCode ?? -1,
        content: parse(result),
      })
    })
  })

  function parse(json: string) {
    try {
      return JSON.parse(json)
    } catch {
      return json
    }
  }
}
