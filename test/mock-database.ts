import { Database, ItemDTO, ItemSpecification } from '../src/pg-database'

export class MockDatabase implements Database {
  itemsToReturn: ItemDTO[] = []
  lastRequestedSpecfication?: ItemSpecification

  async items(specification: ItemSpecification): Promise<ItemDTO[]> {
    this.lastRequestedSpecfication = specification
    return this.itemsToReturn
  }
}
