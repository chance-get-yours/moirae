import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { OrderAggregate } from "../aggregates/order.aggregate";
import { OrderCreatedEvent } from "../events/order-created.event";
import { OrderService } from "../order.service";

@EventHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  constructor(
    private readonly factory: AggregateFactory,
    private readonly service: OrderService,
  ) {}

  public async execute(event: OrderCreatedEvent): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      event.$streamId,
      OrderAggregate,
    );
    await this.service.save(aggregate.toProjection());
  }
}
