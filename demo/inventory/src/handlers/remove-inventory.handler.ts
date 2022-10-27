import {
  AggregateFactory,
  CommandHandler,
  ICommandHandler,
} from "@moirae/core";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { RemoveInventoryCommand } from "../commands/remove-inventory.command";
import { InventoryRemovedEvent } from "@demo/common";
import { InvalidRemoveInventoryException } from "../exceptions/invalid-remove-inventory.exception";

@CommandHandler(RemoveInventoryCommand)
export class RemoveInventoryHandler
  implements ICommandHandler<RemoveInventoryCommand>
{
  constructor(private readonly factory: AggregateFactory) {}

  public async execute(command: RemoveInventoryCommand): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      command.input.inventoryId,
      InventoryAggregate,
    );
    const event = new InventoryRemovedEvent(aggregate.id, {
      quantity: command.input.quantity,
    });
    aggregate.apply(event);

    if (aggregate.quantity < 0)
      throw new InvalidRemoveInventoryException(event);
    await aggregate.commit(command);
  }
}
