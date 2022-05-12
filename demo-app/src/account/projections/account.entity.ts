import { RegisterType } from "@moirae/core";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@RegisterType()
@Entity()
export class Account {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("decimal")
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
