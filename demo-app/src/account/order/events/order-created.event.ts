import { Event, IEvent, RegisterType } from "@moirae/core";
import { Order } from "../projections/order.entity";

type OrderCreatedEventPayload = Pick<
  Order,
  "accountId" | "cost" | "id" | "inventoryId" | "quantity"
>;

@RegisterType()
export class OrderCreatedEvent extends Event implements IEvent {
  public readonly $version = 1;

  constructor(
    public readonly $streamId: string,
    public readonly $data: OrderCreatedEventPayload,
  ) {
    super();
  }
}
