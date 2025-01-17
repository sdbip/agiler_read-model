import pg from 'pg'
import { DATABASE_CONNECTION_STRING } from './config.js'
import { Database } from './database.js'
import { ItemDTO } from './item-dto.js'
import { ItemSpecification } from './item-specification.js'

export class PGDatabase implements Database {
  async item(id: string): Promise<ItemDTO | undefined> {

    const db = new pg.Client(DATABASE_CONNECTION_STRING)
    await db.connect()
    const rs = await db.query('SELECT * FROM Items WHERE id = $1', [ id ])
    const result = rs.rows
    await db.end()

    return result.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      progress: r.progress,
      parentId: r.parent_id ?? undefined,
    } as ItemDTO))[0]
  }

  async itemsWithSpecification(specification: ItemSpecification) {
    const clause = whereClause(specification)
    const query = clause ? `SELECT * FROM Items WHERE ${clause}` : 'SELECT * FROM Items'

    const db = new pg.Client(DATABASE_CONNECTION_STRING)
    await db.connect()
    const rs = await db.query(
      query,
      parameters(specification))

    const result = rs.rows
    await db.end()
    return result.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      progress: r.progress,
      parentId: r.parent_id ?? undefined,
    } as ItemDTO))
  }
}


function whereClause(specification: ItemSpecification) {
  const parameters = [ '' ] // Create a 1-based array by placing nonsense in position 0
  if (specification.progress) parameters.push('progress')
  if (specification.parent) parameters.push('parent')
  if (specification.type) parameters.push('type')

  const result = []
  if (specification.progress) result.push(`progress = ANY($${parameters.indexOf('progress')}::TEXT[])`)
  if (specification.parent === null) result.push('parent_id IS NULL')
  if (specification.parent) result.push(`parent_id = $${parameters.indexOf('parent')}`)
  if (specification.type) result.push(`type = ANY($${parameters.indexOf('type')}::TEXT[])`)
  return result.join(' AND ')
}

function parameters(specification: ItemSpecification) {
  const progressIn = toArray(specification.progress)
  const typeIn = toArray(specification.type)
  return [ progressIn, specification.parent, typeIn ].filter(p => p)
}

function toArray(value?: string | string[]) {
  return typeof value === 'string' ? [ value ] : value
}
