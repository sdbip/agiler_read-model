import { assert } from 'chai'
import { promises as fs } from 'fs'
import http from 'http'
import { PORT } from '../src/config'
import { close, overrideDatabase } from '../src/index'
import { ItemDTO } from '../src/pg-database'
import { MockDatabase } from './mock-database'

describe('Read Model', () => {

  const database = new MockDatabase()

  before(async () => {
    overrideDatabase(database)
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

      const items: ItemDTO[] = [
        {
          id: 'epic',
          type: 'Epic',
          title: 'Epic Feature',
          progress: 'notStarted',
          parent_id: null,
        },
        {
          id: 'mmf',
          type: 'Feature',
          title: 'MMF',
          progress: 'notStarted',
          parent_id: 'epic',
        },
        {
          id: 'story',
          type: 'Story',
          title: 'Parent Story',
          progress: 'notStarted',
          parent_id: null,
        },
        {
          id: 'subtask',
          type: 'Task',
          title: 'Task',
          progress: 'notStarted',
          parent_id: 'story',
        },
      ]
      database.itemsToReturn = items

      const response = await getAll()
      assert.deepEqual(response.content, items)
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
