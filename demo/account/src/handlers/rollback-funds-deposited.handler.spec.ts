import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { FundsDepositedEvent } from "@demo/common";
import { Account } from "../projections/account.entity";
import { RollbackFundsWithdrawnHandler } from "./rollback-funds-deposited.handler";

describe("RollbackFundsWithdrawnHandler", () => {
  let factory: AggregateFactory;
  let handler: RollbackFundsWithdrawnHandler;
  let service: AccountService;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RollbackFundsWithdrawnHandler,
        ...mockAggregateFactory(),
        {
          provide: AccountService,
          useFactory: () => ({ save: jest.fn() }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(RollbackFundsWithdrawnHandler);
    service = module.get(AccountService);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let aggregate: AccountAggregate;
    let streamId: string;
    beforeEach(() => {
      streamId = faker.datatype.uuid();
      aggregate = new AccountAggregate(streamId);

      jest.spyOn(factory, "mergeContext").mockResolvedValue(aggregate);
    });

    it("will call service save", async () => {
      const event = new FundsDepositedEvent(streamId, {
        funds: -10,
      });

      aggregate.apply(event);

      const account = new Account();
      account.balance = aggregate.balance;
      account.createdAt = aggregate.createdAt;
      account.id = aggregate.id;
      account.name = aggregate.name;
      account.updatedAt = aggregate.updatedAt;

      (service.save as jest.Mock).mockResolvedValue(account);

      await handler.execute(event);

      expect(service.save).toHaveBeenCalledWith({
        id: aggregate.id,
        balance: aggregate.balance,
        createdAt: aggregate.createdAt,
        name: aggregate.name,
        updatedAt: aggregate.updatedAt,
      });
    });
  });
});
