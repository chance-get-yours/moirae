import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { AccountService } from "../account.service";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { AccountCreatedEvent } from "../events/account-created.event";
import { Account } from "../projections/account.entity";
import { AccountCreatedHandler } from "./account-created.handler";

describe("AccountCreatedHandler", () => {
  let factory: AggregateFactory;
  let handler: AccountCreatedHandler;
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
        AccountCreatedHandler,
        ...mockAggregateFactory(),
        {
          provide: AccountService,
          useFactory: () => ({ save: jest.fn() }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(AccountCreatedHandler);
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
      const event = new AccountCreatedEvent(streamId, {
        balance: 0,
        createdAt: new Date(),
        name: faker.lorem.word(),
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
