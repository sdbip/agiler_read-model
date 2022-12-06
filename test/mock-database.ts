import { Database, ItemDTO } from '../src/pg-database'

export class MockDatabase implements Database {
  itemsToReturn: ItemDTO[] = []

  async items(): Promise<ItemDTO[]> {
    return this.itemsToReturn
  }
}
