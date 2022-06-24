import { Column, Entity, OneToMany } from "typeorm";
import { SetValue } from "./set-value.entity";

@Entity()
export class SetRoot {
  @Column({ primary: true })
  key: string;

  @OneToMany(() => SetValue, (setValue: SetValue) => setValue.set, {
    cascade: true,
    eager: true,
  })
  values: SetValue[];
}
