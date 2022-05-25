import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { randomUUID } from "crypto";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { CreateInventoryCommand } from "../commands/create-inventory.command";
import { InventoryCreatedEvent } from "../events/inventory-created.event";

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler
  implements ICommandHandler<CreateInventoryCommand>
{
  constructor(private readonly factory: AggregateFactory) {}

  public async execute(
    command: CreateInventoryCommand,
  ): Promise<CommandResponse> {
    const response = new CommandResponse();
    response.correlationId = command.$correlationId;

    const id = randomUUID();

    const aggregate = await this.factory.mergeContext(id, InventoryAggregate);
    const event = new InventoryCreatedEvent(id, {
      createdAt: new Date(),
      ...command.input,
    });
    aggregate.apply(event);
    await aggregate.commit(command);
    response.streamId = id;
    response.success = true;
    return response;
  }
}
