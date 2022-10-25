import { EventHandler, IEventHandler } from "@moirae/core";
import { RollbackOrderCreatedEvent } from "@demo/common";
import { OrderService } from "../order.service";

@EventHandler(RollbackOrderCreatedEvent)
export class RollbackOrderCreatedHandler
  implements IEventHandler<RollbackOrderCreatedEvent>
{
  constructor(private readonly service: OrderService) {}

  public async execute(event: RollbackOrderCreatedEvent): Promise<void> {
    await this.service.remove(event.$data.id);
  }
}
