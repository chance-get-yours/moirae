import { faker } from "@faker-js/faker";
import { OrderCreatedEvent } from "../events/order-created.event";
import { OrderAggregate } from "./order.aggregate";

describe("OrderAggregate", () => {
  let aggregate: OrderAggregate;
  let streamId: string;
  beforeEach(() => {
    streamId = faker.datatype.uuid();
    aggregate = new OrderAggregate(streamId);
  });

  it("will apply an OrderCreatedEvent", () => {
    const event = new OrderCreatedEvent(streamId, {
      accountId: faker.datatype.uuid(),
      cost: 120,
      inventoryId: faker.datatype.uuid(),
      quantity: 4,
    });

    aggregate.apply(event);
    expect(aggregate.accountId).toEqual(event.$data.accountId);
    expect(aggregate.cost).toEqual(event.$data.cost);
    expect(aggregate.inventoryId).toEqual(event.$data.inventoryId);
    expect(aggregate.quantity).toEqual(event.$data.quantity);
  });
});
