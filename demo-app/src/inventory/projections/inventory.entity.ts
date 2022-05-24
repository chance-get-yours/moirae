import { RegisterType } from "@moirae/core";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Order } from "../../order/projections/order.entity";
import { IInventory } from "../interfaces/inventory.interface";

@RegisterType()
@Entity()
export class Inventory implements IInventory {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.inventory)
  orders: Order[];
}
