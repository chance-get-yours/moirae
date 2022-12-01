import { IInventory } from "@demo/common";
import { IQueryHandler } from "@moirae/core";
import { QueryHandler } from "@moirae/core";
import { Logger } from "@nestjs/common";
import { InventoryService } from "../inventory.service";
import { FindInventoryByIdQuery } from "../queries/find-inventory-by-id.query";

@QueryHandler(FindInventoryByIdQuery)
export class FindInventoryByIdHandler
  implements IQueryHandler<FindInventoryByIdQuery>
{
  constructor(private readonly service: InventoryService) {}

  public execute({ inventoryId }: FindInventoryByIdQuery): Promise<IInventory> {
    return this.service.findOne(inventoryId);
  }
}
