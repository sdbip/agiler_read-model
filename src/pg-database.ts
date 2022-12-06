import { DATABASE_CONNECTION_STRING } from './config.js'
import pg from 'pg'

export type ItemDTO = {
  id: string
  type: string
  title: string
  progress: string
  parent_id: string | null
}

export interface Database {
  items(): Promise<ItemDTO[]>
}

export class PGDatabase implements Database {
  async items() {
    const db = new pg.Client(DATABASE_CONNECTION_STRING)
    await db.connect()
    const rs = await db.query('SELECT * FROM "items"')
    const result = rs.rows
    await db.end()
    return result
  }
}
