import {
  AggregateFactory,
  CommandHandler,
  CommandResponse,
  ICommandHandler,
} from "@moirae/core";
import { randomUUID } from "crypto";
import { UniqueConstraintError } from "../../common/exceptions/unique-contrstraint.error";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { CreateInventoryCommand } from "../commands/create-inventory.command";
import { InventoryCreatedEvent } from "../events/inventory-created.event";
import { InventoryService } from "../inventory.service";

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryHandler
  implements ICommandHandler<CreateInventoryCommand>
{
  constructor(
    private readonly factory: AggregateFactory,
    private readonly service: InventoryService,
  ) {}

  public async execute(
    command: CreateInventoryCommand,
  ): Promise<CommandResponse> {
    const response = new CommandResponse();
    response.correlationId = command.$correlationId;

    const id = randomUUID();

    const aggregate = await this.factory.mergeContext(id, InventoryAggregate);

    if (!(await aggregate.reserveValue("name", command.input.name)))
      throw new UniqueConstraintError(aggregate.constructor.name, "name");
    if (await this.service.nameExists(command.input.name))
      throw new UniqueConstraintError(aggregate.constructor.name, "name");

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
