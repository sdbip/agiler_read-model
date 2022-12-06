import { ItemDTO } from './item-dto.js'
import { ItemSpecification } from './item-specification.js'

export interface Database {
  item(id: string): Promise<ItemDTO | undefined>;
  itemsWithSpecification(specification: ItemSpecification): Promise<ItemDTO[]>;
}
