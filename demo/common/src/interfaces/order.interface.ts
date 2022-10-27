import { IAccount } from "./account.interface";

export interface IOrder {
  id: string;
  accountId: IAccount["id"];
  cost: number;
  createdAt: Date;
  inventoryId: string;
  quantity: number;
  updatedAt: Date;
}
