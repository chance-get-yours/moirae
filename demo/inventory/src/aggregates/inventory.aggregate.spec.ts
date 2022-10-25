import { faker } from "@faker-js/faker";
import { InventoryCreatedEvent } from "@demo/common";
import { InventoryRemovedEvent } from "@demo/common";
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
      price: 21,
      quantity: 4,
    });

    aggregate.apply(event);
    expect(aggregate.createdAt).toEqual(event.$data.createdAt);
    expect(aggregate.id).toEqual(streamId);
    expect(aggregate.name).toEqual(event.$data.name);
    expect(aggregate.price).toEqual(event.$data.price);
    expect(aggregate.quantity).toEqual(event.$data.quantity);
    expect(aggregate.updatedAt).toEqual(event.$timestamp);
  });

  it("will apply an InventoryRemovedEvent", () => {
    const event = new InventoryCreatedEvent(streamId, {
      createdAt: new Date(),
      name: faker.lorem.word(),
      price: 21,
      quantity: 4,
    });

    aggregate.apply(event);

    const remove = new InventoryRemovedEvent(streamId, {
      quantity: 1,
    });

    aggregate.apply(remove);

    expect(aggregate.quantity).toEqual(
      event.$data.quantity - remove.$data.quantity,
    );
  });
});
