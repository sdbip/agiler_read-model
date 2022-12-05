import { assert } from 'chai'
import pg from 'pg'
import { DATABASE } from '../src/config'

describe('Database Configuration', () => {

  const client = new pg.Client({
    database: DATABASE,
  })

  before(async () => {
    await client.connect()
  })
  
  after(async () => {
    client.end()
  })

  it('has configuration', async () => {
    assert.exists(DATABASE, 'Configuration missing. Add `export DATABASE=<value>` to .env file')
  })

  it('can connect', async () => {
    const rs = await client.query('select 1 as one')
    assert.deepEqual(rs.rows, [ { one: 1 } ])
  })
})
