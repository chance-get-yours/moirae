import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
  ICommandHandlerOptions,
} from "@moirae/core";
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
    options: ICommandHandlerOptions,
  ): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      options.streamId,
      InventoryAggregate,
    );

    if (!(await aggregate.reserveValue("name", command.input.name)))
      throw new UniqueConstraintError(aggregate.constructor.name, "name");
    if (await this.service.nameExists(command.input.name))
      throw new UniqueConstraintError(aggregate.constructor.name, "name");

    const event = new InventoryCreatedEvent(options.streamId, {
      createdAt: new Date(),
      ...command.input,
    });
    aggregate.apply(event);
    await aggregate.commit(command);
  }
}
