import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { AccountCreatedEvent } from "../events/account-created.event";
import { FundsDepositedEvent } from "../events/funds-deposited.event";
import { Account } from "../projections/account.entity";
import { FundsDepositedHandler } from "./funds-deposited.handler";

describe("FundsDepositedHandler", () => {
  let factory: AggregateFactory;
  let handler: FundsDepositedHandler;
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
        FundsDepositedHandler,
        ...mockAggregateFactory(),
        {
          provide: AccountService,
          useFactory: () => ({ save: jest.fn() }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(FundsDepositedHandler);
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
      aggregate.apply(
        new AccountCreatedEvent(streamId, {
          balance: 0,
          createdAt: new Date(),
          name: faker.lorem.word(),
        }),
      );

      jest.spyOn(factory, "mergeContext").mockResolvedValue(aggregate);
    });

    it("will call service save", async () => {
      const event = new FundsDepositedEvent(streamId, {
        funds: faker.datatype.number({ min: 1, max: 1000 }),
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
