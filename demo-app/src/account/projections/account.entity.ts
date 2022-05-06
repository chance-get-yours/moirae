import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Account {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("decimal")
  balance: number;
}
