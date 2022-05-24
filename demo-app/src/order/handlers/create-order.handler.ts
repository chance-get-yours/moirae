import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { randomUUID } from "crypto";
import { InventoryAggregate } from "../../inventory/aggregates/inventory.aggregate";
import { OrderAggregate } from "../aggregates/order.aggregate";
import { CreateOrderCommand } from "../commands/create-order.command";
import { OrderCreatedEvent } from "../events/order-created.event";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly factory: AggregateFactory) {}

  public async execute(command: CreateOrderCommand): Promise<CommandResponse> {
    const response = new CommandResponse();
    response.correlationId = command.$correlationId;

    const id = randomUUID();

    const inventory = await this.factory.mergeContext(
      command.input.inventoryId,
      InventoryAggregate,
    );
    const order = await this.factory.mergeContext(id, OrderAggregate);
    const event = new OrderCreatedEvent(id, {
      cost: inventory.price * command.input.quantity,
      ...command.input,
    });
    order.apply(event);
    await order.commit(command);

    response.streamId = id;
    response.success = true;
    return response;
  }
}
