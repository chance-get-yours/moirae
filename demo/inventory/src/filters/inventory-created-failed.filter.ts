import { EventBus, ICommand, IMoiraeFilter, MoiraeFilter } from "@moirae/core";
import { InventoryCreatedFailedEvent } from "@demo/common";
import { DuplicateInventoryNameException } from "../exceptions/duplicate-inventory-name.exception";
import { CreateInventoryCommand } from "../commands/create-inventory.command";

@MoiraeFilter(DuplicateInventoryNameException)
export class InventoryCreatedFailedFilter
  implements IMoiraeFilter<DuplicateInventoryNameException>
{
  constructor(private readonly eventBus: EventBus) {}

  catch(
    command: CreateInventoryCommand,
    error: DuplicateInventoryNameException,
  ) {
    const evt = new InventoryCreatedFailedEvent(error.event.$streamId, {
      ...command.input,
      message: error.message,
    });
    evt.$metadata = command.$metadata;

    return this.eventBus.publish(evt);
  }
}
