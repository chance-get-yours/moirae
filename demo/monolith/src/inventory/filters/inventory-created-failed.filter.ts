import { EventBus, ICommand, IMoiraeFilter, MoiraeFilter } from "@moirae/core";
import { InventoryCreatedFailedEvent } from "../events/inventory-created-failed.event";
import { DuplicateInventoryNameException } from "../exceptions/duplicate-inventory-name.exception";

@MoiraeFilter(DuplicateInventoryNameException)
export class InventoryCreatedFailedFilter
  implements IMoiraeFilter<DuplicateInventoryNameException>
{
  constructor(private readonly eventBus: EventBus) {}

  catch(command: ICommand, error: DuplicateInventoryNameException) {
    const evt = InventoryCreatedFailedEvent.fromError(error);
    evt.$metadata = command.$metadata;

    return this.eventBus.publish(evt);
  }
}
