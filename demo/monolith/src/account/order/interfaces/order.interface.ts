import { Inventory } from "../../../inventory/projections/inventory.entity";
import { Account } from "../../projections/account.entity";

export interface IOrder {
  id: string;
  accountId: Account["id"];
  cost: number;
  createdAt: Date;
  inventoryId: Inventory["id"];
  quantity: number;
  updatedAt: Date;
}
