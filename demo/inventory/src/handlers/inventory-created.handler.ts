import { AggregateFactory, EventHandler, IEventHandler } from "@moirae/core";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { InventoryCreatedEvent } from "@demo/common";
import { InventoryService } from "../inventory.service";

@EventHandler(InventoryCreatedEvent)
export class InventoryCreatedHandler
  implements IEventHandler<InventoryCreatedEvent>
{
  constructor(
    private readonly factory: AggregateFactory,
    private readonly service: InventoryService,
  ) {}

  public async execute(event: InventoryCreatedEvent): Promise<void> {
    const aggregate = await this.factory.mergeContext(
      event.$streamId,
      InventoryAggregate,
    );
    await this.service.save(aggregate.toProjection());
    await aggregate.releaseValue("name", aggregate.name);
  }
}
