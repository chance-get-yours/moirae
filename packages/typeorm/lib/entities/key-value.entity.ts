import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity()
export class KeyValue extends BaseEntity {
  @Column({ primary: true })
  key: string;

  @Column()
  value: string;
}
