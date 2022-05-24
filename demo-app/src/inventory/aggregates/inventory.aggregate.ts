import { AggregateRoot, Apply, Projection } from "@moirae/core";
import { InventoryCreatedEvent } from "../events/inventory-created.event";
import { IInventory } from "../interfaces/inventory.interface";

export class InventoryAggregate
  extends AggregateRoot<IInventory>
  implements IInventory
{
  @Projection()
  name: string;

  @Projection()
  quantity: number;

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
    this.quantity = quantity;
  }
}
