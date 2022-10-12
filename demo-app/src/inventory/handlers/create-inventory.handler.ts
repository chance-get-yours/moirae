import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
  ICommandHandlerOptions,
} from "@moirae/core";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { CreateInventoryCommand } from "../commands/create-inventory.command";
import { InventoryCreatedEvent } from "../events/inventory-created.event";
import { DuplicateInventoryNameException } from "../exceptions/duplicate-inventory-name.exception";
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

    const event = new InventoryCreatedEvent(options.streamId, {
      createdAt: new Date(),
      ...command.input,
    });

    if (!(await aggregate.reserveValue("name", command.input.name)))
      throw new DuplicateInventoryNameException(event);
    if (await this.service.nameExists(command.input.name)) {
      await aggregate.releaseValue("name", command.input.name);
      throw new DuplicateInventoryNameException(event);
    }
    aggregate.apply(event);
    await aggregate.commit(command);
  }
}
