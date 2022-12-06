import { assert } from 'chai'
import http from 'http'
import { PORT } from '../src/config'
import { start, stop } from '../src/index'
import { MockDatabase } from './mock-database'

describe('Read Model', () => {

  const database = new MockDatabase()

  before(async () => {
    start(database)
  })

  after(stop)

  describe('GET /item/:id', () => {

    it('returns status code 200', async () => {

      database.itemToReturn = {
        id: 'id',
        type: 'Task',
        title: 'Item',
        progress: 'notStarted',
        parentId: 'parent',
      }

      const response = await getItem('some_id')
      assert.equal(response.statusCode, 200)
    })

    it('returns item data', async () => {

      database.itemToReturn = {
        id: 'id',
        type: 'Task',
        title: 'Item',
        progress: 'notStarted',
        parentId: 'parent',
      }

      const response = await getItem()
      assert.deepEqual(response.content, database.itemToReturn)
    })

    it('requests unparented items only', async () => {
      await getItem('id')

      assert.equal(database.lastRequestedId, 'id')
    })

    function getItem(id?: string) { return get(`http://localhost:${PORT}/item/${id ?? 'some_id'}`) }
  })
})

function get(url: string) {
  return new Promise<ResponseData>((resolve) => {
    const request = http.get(url, async response => {
      resolve(await readResponse(response))
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
