import { DATABASE_CONNECTION_STRING } from './config.js'
import pg from 'pg'

export interface Database {
  items(): Promise<any[]>
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
