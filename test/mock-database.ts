import { ItemSpecification } from '../src/item-specification.js'
import { Database } from '../src/database.js'
import { ItemDTO } from '../src/item-dto.js'

export class MockDatabase implements Database {

  itemToReturn?: ItemDTO
  lastRequestedId?: string

  async item(id: string): Promise<ItemDTO | undefined> {
    this.lastRequestedId = id
    return this.itemToReturn
  }

  itemsToReturn: ItemDTO[] = []
  lastRequestedSpecfication?: ItemSpecification

  async itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]> {
    this.lastRequestedSpecfication = specification
    return this.itemsToReturn
  }
}
