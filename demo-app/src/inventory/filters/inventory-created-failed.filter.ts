import { EventBus, IMoiraeFilter, MoiraeFilter } from "@moirae/core";
import { InventoryCreatedFailedEvent } from "../events/inventory-created-failed.event";
import { DuplicateInventoryNameException } from "../exceptions/duplicate-inventory-name.exception";

@MoiraeFilter(DuplicateInventoryNameException)
export class InventoryCreatedFailedFilter
  implements IMoiraeFilter<DuplicateInventoryNameException>
{
  constructor(private readonly eventBus: EventBus) {}

  catch(error: DuplicateInventoryNameException) {
    return this.eventBus.publish(InventoryCreatedFailedEvent.fromError(error));
  }
}
