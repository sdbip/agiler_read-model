import { DATABASE_CONNECTION_STRING } from './config.js'
import pg from 'pg'

export type ItemSpecification = {
  progress?: string | string[]
  parent?: string | null
  type?: string | string[]
};

export type ItemDTO = {
  id: string
  type: string
  title: string
  progress: string
  parentId?: string
}

export interface Database {
  itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]>
}

export class PGDatabase implements Database {
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
