import { assert } from 'chai'
import { promises as fs } from 'fs'
import pg from 'pg'
import { DATABASE_CONNECTION_STRING } from '../src/config'
import { PGDatabase } from '../src/pg-database'
import { ItemDTO } from '../src/item-dto'

describe('Database Configuration', () => {

  const client = new pg.Client(DATABASE_CONNECTION_STRING)
  const repository = new PGDatabase()

  before(async () => {
    const data = await fs.readFile('./test/items.sql')
    const schemaSQL = data.toString('utf-8')

    await client.connect()
    await client.query(schemaSQL)
  })

  afterEach(async () => {
    await client.query('DELETE FROM "items"')
  })

  after(async () => {
    await client.end()
  })

  describe('item', () => {

    it('finds stored item', async () => {
      const item: ItemDTO = {
        id: 'task',
        type: 'Task',
        title: 'Task',
        progress: 'notStarted',
        parentId: undefined,
      }
      await add(item)

      const returnedItem = await repository.item('task')
      assert.exists(returnedItem)
      assert.deepEqual(returnedItem, item)
    })

    it('returns undefined if not found', async () => {
      const returnedItem = await repository.item('task')
      assert.isUndefined(returnedItem)
    })
  })

  describe('itemsWithSpecification', () => {

    it('finds stored tasks', async () => {
      const item: ItemDTO = {
        id: 'task',
        type: 'Task',
        title: 'Task',
        progress: 'notStarted',
      }
      await add(item)

      const storedRows = await repository.itemsWithSpecification({ progress: 'notStarted' })
      assert.exists(storedRows)
      assert.lengthOf(storedRows, 1)
      assert.include(storedRows[0], item)
      assert.isUndefined(storedRows[0].parentId)
    })

    it('populates parentId', async () => {
      const item = {
        id: 'task',
        type: 'Task',
        title: 'Task',
        progress: 'notStarted',
        parentId: 'parent',
      }
      await add(item)

      const storedRows = await repository.itemsWithSpecification({ progress: 'notStarted' })
      assert.exists(storedRows)
      assert.lengthOf(storedRows, 1)
      assert.equal(storedRows[0].parentId, 'parent')
    })

    it('can be set to only include not started tasks', async () => {
      await add({
        id: 'notStarted',
        type: 'Task',
        title: 'Not started Task',
        progress: 'notStarted',
      })

      await add({
        id: 'completed',
        type: 'Task',
        title: 'Completed Task',
        progress: 'completed',
      })

      const storedRows = await repository.itemsWithSpecification({ progress: 'notStarted' })
      assert.exists(storedRows)
      assert.notInclude(storedRows.map(t => t.id), 'completed')
      assert.include(storedRows.map(t => t.id), 'notStarted')
    })

    it('can be set to only include not completed tasks', async () => {
      await add({
        id: 'notStarted',
        type: 'Task',
        title: 'Not started Task',
        progress: 'notStarted',
      })

      await add({
        id: 'inProgress',
        type: 'Task',
        title: 'In-progress Task',
        progress: 'inProgress',
      })

      await add({
        id: 'completed',
        type: 'Task',
        title: 'Completed Task',
        progress: 'completed',
      })

      const storedRows = await repository.itemsWithSpecification({ progress: [ 'notStarted', 'inProgress' ] })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'inProgress')
      assert.include(storedRows.map(t => t.id), 'notStarted')
      assert.notInclude(storedRows.map(t => t.id), 'completed')
    })

    it('excludes subtasks if specified', async () => {
      await add({
        id: 'subtask',
        type: 'Task',
        title: 'Subtask',
        progress: 'notStarted',
        parentId: 'a_parent',
      })

      const storedRows = await repository.itemsWithSpecification({ parent: null })
      assert.exists(storedRows)
      assert.notInclude(storedRows.map(t => t.id), 'subtask')
    })

    it('includes stories', async () => {
      await add({
        id: 'story',
        type: 'Story',
        title: 'Completed Story',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ progress: 'notStarted' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'story')
    })

    it('can be specified to only return subtasks of a specific parent', async () => {
      await add({
        id: 'subtask',
        type: 'Task',
        title: 'Subtask',
        progress: 'notStarted',
        parentId: 'a_parent',
      })

      await add({
        id: 'other_task',
        type: 'Task',
        title: 'Stand-alone task',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ parent: 'a_parent' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'subtask')
      assert.notInclude(storedRows.map(t => t.id), 'other_task')
    })

    it('allows specifying both parent and progress', async () => {
      await add({
        id: 'subtask',
        type: 'Task',
        title: 'Subtask',
        progress: 'notStarted',
        parentId: 'a_parent',
      })

      await add({
        id: 'other_task',
        type: 'Task',
        title: 'Stand-alone task',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ parent: 'a_parent', progress: 'notStarted' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'subtask')
      assert.notInclude(storedRows.map(t => t.id), 'other_task')
    })

    it('returns only items of a specified type', async () => {
      await add({
        id: 'feature',
        type: 'Feature',
        title: 'Feature',
        progress: 'notStarted',
      })

      await add({
        id: 'task',
        type: 'Task',
        title: 'Task',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ type: 'Feature' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'feature')
      assert.notInclude(storedRows.map(t => t.id), 'task')
    })

    it('allows specifying multiple types', async () => {
      await add({
        id: 'feature',
        type: 'Feature',
        title: 'Feature',
        progress: 'notStarted',
      })

      await add({
        id: 'epic',
        type: 'Epic',
        title: 'Epic',
        progress: 'notStarted',
      })

      await add({
        id: 'task',
        type: 'Task',
        title: 'Task',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ type: [ 'Feature', 'Epic' ] })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'feature')
      assert.include(storedRows.map(t => t.id), 'epic')
      assert.notInclude(storedRows.map(t => t.id), 'task')
    })

    it('allows specifying type and progress', async () => {
      await add({
        id: 'completed',
        type: 'Task',
        title: 'Completed task',
        progress: 'completed',
      })

      await add({
        id: 'task',
        type: 'Task',
        title: 'Stand-alone task',
        progress: 'notStarted',
      })

      await add({
        id: 'story',
        type: 'Story',
        title: 'Story',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ progress: 'notStarted', type: 'Task' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'task')
      assert.notInclude(storedRows.map(t => t.id), 'completed')
      assert.notInclude(storedRows.map(t => t.id), 'story')
    })

    it('allows specifying type and parent', async () => {
      await add({
        id: 'subtask',
        type: 'Task',
        title: 'Subtask',
        progress: 'notStarted',
        parentId: 'a_parent',
      })

      await add({
        id: 'task',
        type: 'Task',
        title: 'Task',
        progress: 'notStarted',
      })

      await add({
        id: 'story',
        type: 'Story',
        title: 'Story',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ parent: null, type: 'Task' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'task')
      assert.notInclude(storedRows.map(t => t.id), 'subtask')
      assert.notInclude(storedRows.map(t => t.id), 'story')
    })

    it('allows specifying type, parent and progress all at once', async () => {
      await add({
        id: 'subtask',
        type: 'Task',
        title: 'Subtask',
        progress: 'notStarted',
        parentId: 'a_parent',
      })

      await add({
        id: 'other_task',
        type: 'Task',
        title: 'Stand-alone task',
        progress: 'notStarted',
      })

      await add({
        id: 'story',
        type: 'Story',
        title: 'Story',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({ parent: 'a_parent', progress: 'notStarted', type: 'Task' })
      assert.exists(storedRows)
      assert.include(storedRows.map(t => t.id), 'subtask')
      assert.notInclude(storedRows.map(t => t.id), 'other_task')
      assert.notInclude(storedRows.map(t => t.id), 'story')
    })

    it('returns everything if not provided a specification', async () => {
      await add({
        id: 'subtask',
        type: 'Task',
        title: 'Subtask',
        progress: 'notStarted',
        parentId: 'a_parent',
      })

      await add({
        id: 'other_task',
        type: 'Task',
        title: 'Stand-alone task',
        progress: 'notStarted',
      })

      const storedRows = await repository.itemsWithSpecification({})
      assert.lengthOf(storedRows, 2)
    })
  })

  async function add(item: ItemDTO) {
    await client.query(
      'INSERT INTO "items" (id, title, progress, type, parent_id) VALUES ($1, $2, $3, $4, $5)',
      [ item.id, item.title, item.progress, item.type, item.parentId ])
  }
})
