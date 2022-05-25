import { faker } from "@faker-js/faker";
import { AccountCreatedEvent } from "../events/account-created.event";
import { FundsDepositedEvent } from "../events/funds-deposited.event";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";
import { OrderCreatedEvent } from "../events/order-created.event";
import { AccountAggregate } from "./account.aggregate";

describe("AccountAggregate", () => {
  let aggregate: AccountAggregate;
  let streamId: string;
  beforeEach(() => {
    streamId = faker.datatype.uuid();
    aggregate = new AccountAggregate(streamId);
  });

  it("will apply an AccountCreatedEvent", () => {
    const event = new AccountCreatedEvent(streamId, {
      balance: 0,
      createdAt: new Date(),
      name: faker.lorem.word(),
    });

    aggregate.apply(event);
    expect(aggregate.balance).toEqual(event.$data.balance);
    expect(aggregate.createdAt).toEqual(event.$data.createdAt);
    expect(aggregate.id).toEqual(streamId);
    expect(aggregate.name).toEqual(event.$data.name);
    expect(aggregate.updatedAt).toEqual(event.$timestamp);
  });

  it("will apply a FundsDepositedEvent", () => {
    const event = new FundsDepositedEvent(streamId, {
      funds: 100,
    });

    aggregate.apply(
      new AccountCreatedEvent(streamId, {
        balance: 0,
        name: faker.lorem.word(),
        createdAt: new Date(),
      }),
    );

    aggregate.apply(event);
    expect(aggregate.balance).toEqual(event.$data.funds);
    expect(aggregate.updatedAt).toEqual(event.$timestamp);
  });

  it("will apply a FundsWithdrawnEvent", () => {
    const event = new FundsWithdrawnEvent(streamId, {
      funds: -100,
    });

    aggregate.apply(
      new AccountCreatedEvent(streamId, {
        balance: event.$data.funds * -1,
        name: faker.lorem.word(),
        createdAt: new Date(),
      }),
    );

    aggregate.apply(event);
    expect(aggregate.balance).toEqual(0);
    expect(aggregate.updatedAt).toEqual(event.$timestamp);
  });

  it("will apply an OrderCreatedEvent", () => {
    const event = new OrderCreatedEvent(aggregate.id, {
      accountId: aggregate.id,
      cost: 1,
      id: faker.datatype.uuid(),
      inventoryId: faker.datatype.uuid(),
      quantity: 1,
    });

    expect(aggregate.orders).not.toBeDefined();
    aggregate.apply(event);
    expect(aggregate.orders).toHaveLength(1);
    expect(aggregate.orders[0]).toMatchObject(
      expect.objectContaining(event.$data),
    );
  });
});
