import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
} from "typeorm";
import { BaseEntity } from "./base.entity";
import { SetRoot } from "./set-root.entity";

@Entity()
@Unique(["setKey", "value"])
export class SetValue extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => SetRoot, (setRoot: SetRoot) => setRoot.values)
  set: SetRoot;

  @RelationId((setValue: SetValue) => setValue.set)
  @Column()
  setKey: string;

  @Column()
  value: string;
}
