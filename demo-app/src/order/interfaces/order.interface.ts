import { Account } from "../../account/projections/account.entity";
import { Inventory } from "../../inventory/projections/inventory.entity";

export interface IOrder {
  id: string;
  accountId: Account["id"];
  cost: number;
  createdAt: Date;
  inventoryId: Inventory["id"];
  quantity: number;
  updatedAt: Date;
}
