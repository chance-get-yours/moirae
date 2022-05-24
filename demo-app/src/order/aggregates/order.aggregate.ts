import { AggregateRoot, Apply, Projection } from "@moirae/core";
import { OrderCreatedEvent } from "../events/order-created.event";
import { IOrder } from "../interfaces/order.interface";

export class OrderAggregate extends AggregateRoot<IOrder> implements IOrder {
  @Projection()
  accountId: string;

  @Projection()
  cost: number;

  @Projection()
  createdAt: Date;

  @Projection()
  public get id(): string {
    return this.streamId;
  }

  @Projection()
  inventoryId: string;

  @Projection()
  quantity: number;

  @Projection()
  updatedAt: Date;

  @Apply(OrderCreatedEvent)
  handleCreate(event: OrderCreatedEvent): void {
    const { accountId, cost, inventoryId, quantity } = event.$data;
    this.accountId = accountId;
    this.cost = cost;
    this.inventoryId = inventoryId;
    this.quantity = quantity;
    this.createdAt = new Date();
  }
}
