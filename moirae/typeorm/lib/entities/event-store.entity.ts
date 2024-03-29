import { EventType, IEvent, IRequestMetadata } from "@moirae/core";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(["$streamId"])
export class EventStore<T = unknown> implements IEvent<T> {
  @PrimaryGeneratedColumn("increment", { name: "order" })
  $order: number;

  @Column({
    name: "correlation_id",
    nullable: true,
  })
  $correlationId?: string;

  @Column({
    name: "data",
    type: "simple-json",
  })
  $data: T;

  @Column({ name: "stream_id" })
  $streamId: string;

  @Column({ name: "timestamp" })
  $timestamp: Date;

  @Column({ name: "metadata", nullable: true, type: "simple-json" })
  $metadata?: IRequestMetadata;

  @Column({ name: "name" })
  $name: string;

  @Column({ enum: EventType, name: "type", type: "simple-enum" })
  $type: EventType;

  @Column({ name: "version" })
  $version: number;

  @Column({ name: "uuid", unique: true })
  $uuid: string;
}
