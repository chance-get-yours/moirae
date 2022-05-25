import { ICommand, IEvent, Saga, SagaHandler } from "@moirae/core";
import { Injectable } from "@nestjs/common";
import { OrderCreatedEvent } from "../../account/events/order-created.event";
import { RemoveInventoryCommand } from "../../inventory/commands/remove-inventory.command";

@Injectable()
export class ProcessOrderSaga {
  @Saga()
  postOrderCreated: SagaHandler = (event: IEvent): ICommand[] => {
    if (!(event instanceof OrderCreatedEvent)) return [];
    return [
      new RemoveInventoryCommand({
        inventoryId: event.$data.inventoryId,
        quantity: event.$data.quantity,
      }),
    ];
  };
}
