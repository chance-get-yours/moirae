import { AggregateRoot, Apply, Projection } from "@moirae/core";
import { InventoryCreatedFailedEvent } from "@demo/common";
import { InventoryCreatedEvent } from "@demo/common";
import { InventoryRemovedEvent } from "@demo/common";
import { IInventory } from "@demo/common";

export class InventoryAggregate
  extends AggregateRoot<IInventory>
  implements IInventory
{
  @Projection()
  name: string;

  @Projection()
  quantity: number;

  @Projection()
  price: number;

  @Projection()
  createdAt: Date;

  @Projection()
  public updatedAt: Date;

  @Projection()
  public get id(): string {
    return this.streamId;
  }

  @Apply(InventoryCreatedEvent)
  protected handleCreate(event: InventoryCreatedEvent): void {
    const { createdAt, name, quantity } = event.$data;
    this.createdAt = createdAt;
    this.name = name;
    this.price = event.$data.price;
    this.quantity = quantity;
  }

  @Apply(InventoryRemovedEvent)
  protected handleRemove(event: InventoryRemovedEvent): void {
    this.quantity -= event.$data.quantity;
  }

  @Apply(InventoryCreatedFailedEvent)
  void() {
    //stub
  }
}
