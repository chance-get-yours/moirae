import { IInventory } from "@demo/common";
import { IQuery } from "@moirae/core";
import { Query } from "@moirae/core";
import { RegisterType } from "@moirae/core";

@RegisterType()
export class FindInventoryByIdQuery extends Query implements IQuery {
  public readonly $version = 1;

  constructor(public readonly inventoryId: IInventory["id"]) {
    super();
  }
}
