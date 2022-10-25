import { Event, IEvent, RegisterType } from "@moirae/core";
import { IOrder } from "../interfaces/order.interface";

type OrderCreatedEventPayload = Pick<
  IOrder,
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
