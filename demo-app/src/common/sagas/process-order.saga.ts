import { ICommand, Saga, SagaStep } from "@moirae/core";
import { Injectable } from "@nestjs/common";
import { RollbackAccountCommand } from "../../account/commands/rollback-account.command";
import { OrderCreatedEvent } from "../../account/order/events/order-created.event";
import { RemoveInventoryCommand } from "../../inventory/commands/remove-inventory.command";

@Injectable()
export class ProcessOrderSaga extends Saga {
  @SagaStep(OrderCreatedEvent, RollbackAccountCommand)
  postOrderCreated(event: OrderCreatedEvent): ICommand[] {
    return [
      new RemoveInventoryCommand({
        inventoryId: event.$data.inventoryId,
        orderId: event.$data.id,
        quantity: event.$data.quantity,
      }),
    ];
  }
}
