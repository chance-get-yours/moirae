import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { InventoryRemovedEvent } from "../events/inventory-removed.event";
import { InventoryService } from "../inventory.service";

@EventHandler(InventoryRemovedEvent)
export class InventoryRemovedHandler
  implements IEventHandler<InventoryRemovedEvent>
{
  constructor(
    private readonly factory: AggregateFactory,
    private readonly service: InventoryService,
  ) {}

  public async execute(event: InventoryRemovedEvent): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      event.$streamId,
      InventoryAggregate,
    );
    await this.service.save(aggregate.toProjection());
  }
}
