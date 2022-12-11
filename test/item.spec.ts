import { assert } from 'chai'
import http from 'http'
import { PORT } from '../src/config.js'
import { start, stop } from '../src/index.js'
import { ItemDTO } from '../src/item-dto.js'
import { MockDatabase } from './mock-database.js'

describe('Read Model', () => {

  const database = new MockDatabase()

  before(async () => {
    start(database)
  })

  after(stop)

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
        },
        {
          id: 'mmf',
          type: 'Feature',
          title: 'MMF',
          progress: 'notStarted',
          parentId: 'epic',
        },
        {
          id: 'story',
          type: 'Story',
          title: 'Parent Story',
          progress: 'notStarted',
        },
        {
          id: 'subtask',
          type: 'Task',
          title: 'Task',
          progress: 'notStarted',
          parentId: 'story',
        },
      ]
      database.itemsToReturn = items

      const response = await getAll()
      assert.deepEqual(response.content, items)
    })

    it('requests open items only', async () => {
      await getAll()

      assert.deepInclude(
        database.lastRequestedSpecfication,
        { progress: 'notStarted' })
    })

    it('requests unparented items only', async () => {
      const response = await getAll()

      assert.equal(response.statusCode, 200)
      assert.deepInclude(
        database.lastRequestedSpecfication,
        { parent: null })
    })

    it('requests only items of the specified type', async () => {
      const response = await getAll('type=Feature|Epic')
      assert.equal(response.statusCode, 200)

      assert.deepInclude(
        database.lastRequestedSpecfication,
        { type: [ 'Feature', 'Epic' ] })
    })

    function getAll(query?: string) { return get(`http://localhost:${PORT}/item?${query ?? ''}`) }
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
