import { RegisterType } from "@moirae/core";
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Account } from "../../projections/account.entity";
import { IOrder } from "@demo/common";

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

  @Column()
  inventoryId: string;

  @Column()
  quantity: number;

  @Column()
  updatedAt: Date;
}
