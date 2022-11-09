import { IInventory } from "@demo/common";
import { IQuery, Query, RegisterType } from "@moirae/core";
import { InventoryQuery } from "./inventory-query.base";

@RegisterType()
export class FindInventoryByIdQuery extends InventoryQuery implements IQuery {
  public readonly $version = 1;

  constructor(public readonly inventoryId: IInventory["id"]) {
    super();
  }
}
