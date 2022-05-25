import { ICommand, IEvent, Saga, SagaHandler } from "@moirae/core";
import { Injectable } from "@nestjs/common";
import { OrderCreatedEvent } from "../../account/events/order-created.event";

@Injectable()
export class ProcessOrderSaga {
  @Saga()
  postOrderCreated: SagaHandler = (event: IEvent): ICommand[] => {
    if (!(event instanceof OrderCreatedEvent)) return [];
    return [
      // new ExportInventoryCommand({
      //     inventoryId: event.$data.inventoryId,
      //     quantity: event.$data.quantity
      // })
    ];
  };
}
