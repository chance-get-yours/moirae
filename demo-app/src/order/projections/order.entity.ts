import { RegisterType } from "@moirae/core";
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Account } from "../../account/projections/account.entity";
import { Inventory } from "../../inventory/projections/inventory.entity";
import { IOrder } from "../interfaces/order.interface";

@RegisterType()
@Entity()
export class Order implements IOrder {
  @PrimaryColumn("uuid")
  id: string;

  @ManyToOne(() => Account)
  account: Account;

  @RelationId((order: Order) => order.account)
  @Column()
  accountId: string;

  @Column()
  cost: number;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Inventory)
  inventory: Inventory;

  @RelationId((order: Order) => order.inventory)
  @Column()
  inventoryId: string;

  @Column()
  quantity: number;

  @Column()
  updatedAt: Date;
}
