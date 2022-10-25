import { ICommand, Saga, SagaStep } from "@moirae/core";
import { Injectable } from "@nestjs/common";
import { RollbackAccountCommand } from "@demo/account";
import { OrderCreatedEvent } from "@demo/common";
import { RemoveInventoryCommand } from "@demo/inventory";

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
