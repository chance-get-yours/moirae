import { RegisterType } from "@moirae/core";
import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
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

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
