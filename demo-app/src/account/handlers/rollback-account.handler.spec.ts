import { faker } from "@faker-js/faker";
import {
  AggregateFactory,
  CommandResponse,
  mockAggregateFactory,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { RollbackAccountCommand } from "../commands/rollback-account.command";
import { AccountCreatedEvent } from "../events/account-created.event";
import { OrderCreatedEvent } from "../events/order-created.event";
import { RollbackOrderCreatedEvent } from "../events/rollback-order-created.event";
import { RollbackAccountHandler } from "./rollback-account.handler";

describe("RollbackAccountHandler", () => {
  let factory: AggregateFactory;
  let handler: RollbackAccountHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RollbackAccountHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(RollbackAccountHandler);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let aggregate: AccountAggregate;
    let correlationId: string;
    beforeEach(async () => {
      correlationId = faker.datatype.uuid();
      aggregate = await factory.mergeContext(
        faker.datatype.uuid(),
        AccountAggregate,
      );
      aggregate.apply(
        new AccountCreatedEvent(aggregate.streamId, {
          balance: 100,
          createdAt: new Date(),
          name: faker.lorem.word(),
        }),
      );
      const transactionEvent = new OrderCreatedEvent(aggregate.streamId, {
        accountId: aggregate.id,
        cost: 50,
        id: faker.datatype.uuid(),
        inventoryId: faker.datatype.uuid(),
        quantity: 1,
      });
      transactionEvent.$correlationId = correlationId;
      aggregate.apply(transactionEvent);
      await aggregate.commit();
    });

    it("will rollback a specific transaction by correlationId", async () => {
      const command = new RollbackAccountCommand(aggregate.id, correlationId);

      const commitSpy = jest.spyOn(factory, "commitEvents");

      expect(await handler.execute(command)).toBeInstanceOf(CommandResponse);
      expect(commitSpy).toHaveBeenCalledWith([
        expect.objectContaining({
          $name: RollbackOrderCreatedEvent.name,
          $data: {
            id: expect.any(String),
          },
        }),
      ]);
    });
  });
});
