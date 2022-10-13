import { faker } from "@faker-js/faker";
import { IEvent } from "@moirae/core";
import { AccountCreatedEvent } from "../events/account-created.event";
import { FundsDepositedEvent } from "../events/funds-deposited.event";
import { FundsWithdrawalFailedEvent } from "../events/funds-withdrawal-failed.event";
import { FundsWithdrawnEvent } from "../events/funds-withdrawn.event";
import { OrderCreatedEvent } from "../order/events/order-created.event";
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

  describe("FundsWithdrawnEvent", () => {
    beforeEach(() => {
      aggregate.apply(
        new AccountCreatedEvent(streamId, {
          balance: 100,
          name: faker.lorem.word(),
          createdAt: new Date(),
        }),
      );
    });
    it("will apply a FundsWithdrawnEvent", () => {
      const event = new FundsWithdrawnEvent(streamId, {
        funds: aggregate.balance * -1,
      });

      aggregate.apply(event);
      expect(aggregate.balance).toEqual(0);
      expect(aggregate.updatedAt).toEqual(event.$timestamp);
    });

    it("will rollback a FundsWithdrawnEvent", () => {
      const initialBalance = aggregate.balance;
      const event = new FundsWithdrawnEvent(streamId, {
        funds: aggregate.balance * -1,
      });

      aggregate.apply(event);

      const rollbackEvent = aggregate.createRollbackFundsWithdrawnEvent(event);
      expect(rollbackEvent.$data.funds).toEqual(event.$data.funds);

      aggregate.apply(rollbackEvent);
      expect(aggregate.balance).toEqual(initialBalance);
    });
  });

  describe("OrderCreatedEvent", () => {
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

    it("will rollback an OrderCreatedEvent", () => {
      const event = new OrderCreatedEvent(aggregate.id, {
        accountId: aggregate.id,
        cost: 1,
        id: faker.datatype.uuid(),
        inventoryId: faker.datatype.uuid(),
        quantity: 1,
      });
      aggregate.apply(event);

      const rollbackEvent = aggregate.createRollbackOrderCreated(event);
      expect(rollbackEvent.$data.id).toEqual(event.$data.id);
      aggregate.apply(rollbackEvent);
      expect(aggregate.orders).toHaveLength(0);
    });
  });

  describe("Void Sink", () => {
    const voidEvents = [
      (id: string) => new FundsWithdrawalFailedEvent(id, { funds: 100 }),
    ];

    it.each(voidEvents)(
      "will apply but do nothing for %s event",
      (eventMaker: (id: string) => IEvent) => {
        const initial = { ...aggregate };
        aggregate.apply(eventMaker(aggregate.id));
        expect(aggregate).toMatchObject(initial);
      },
    );
  });
});
