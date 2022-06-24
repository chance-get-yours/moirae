import { Column, Entity } from "typeorm";

@Entity()
export class KeyValue<T = any> {
  @Column({ primary: true })
  key: string;

  @Column()
  value: string;
}
