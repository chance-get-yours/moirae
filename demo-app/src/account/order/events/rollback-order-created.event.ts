import { Event, IEvent, RegisterType } from "@moirae/core";
import { OrderCreatedEvent } from "./order-created.event";

type RollbackOrderCreatedEventPayload = Pick<OrderCreatedEvent["$data"], "id">;

@RegisterType()
export class RollbackOrderCreatedEvent extends Event implements IEvent {
  public readonly $data: RollbackOrderCreatedEventPayload;
  public readonly $version: number = 1;

  constructor(
    public readonly $streamId: string,
    data: RollbackOrderCreatedEventPayload,
  ) {
    super();
    this.$data = data;
  }
}
