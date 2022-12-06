import { Database, ItemDTO, ItemSpecification } from '../src/pg-database'

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
