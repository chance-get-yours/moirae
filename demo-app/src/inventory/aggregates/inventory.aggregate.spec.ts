import { faker } from "@faker-js/faker";
import { InventoryCreatedEvent } from "../events/inventory-created.event";
import { InventoryAggregate } from "./inventory.aggregate";

describe("InventoryAggregate", () => {
  let aggregate: InventoryAggregate;
  let streamId: string;
  beforeEach(() => {
    streamId = faker.datatype.uuid();
    aggregate = new InventoryAggregate(streamId);
  });

  it("will apply an InventoryCreatedEvent", () => {
    const event = new InventoryCreatedEvent(streamId, {
      createdAt: new Date(),
      name: faker.lorem.word(),
      quantity: 4,
    });

    aggregate.apply(event);
    expect(aggregate.createdAt).toEqual(event.$data.createdAt);
    expect(aggregate.id).toEqual(streamId);
    expect(aggregate.name).toEqual(event.$data.name);
    expect(aggregate.quantity).toEqual(event.$data.quantity);
    expect(aggregate.updatedAt).toEqual(event.$timestamp);
  });
});
