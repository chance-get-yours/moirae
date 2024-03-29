import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { DepositFundsCommand } from "../commands/deposit-funds.command";
import { AccountCreatedEvent } from "@demo/common";
import { DepositFundsHandler } from "./deposit-funds.handler";

describe("DepositFundsHandler", () => {
  let factory: AggregateFactory;
  let handler: DepositFundsHandler;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DepositFundsHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(DepositFundsHandler);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let streamId: string;

    beforeEach(async () => {
      streamId = faker.datatype.uuid();
      const create = new AccountCreatedEvent(streamId, {
        balance: 0,
        createdAt: new Date(),
        name: faker.lorem.word(),
      });
      await factory.commitEvents([create]);
    });

    it("will apply the event to the aggregate", async () => {
      const command = new DepositFundsCommand({
        accountId: streamId,
        funds: faker.datatype.number({ min: 1, max: 1000 }),
      });

      const commitSpy = jest.spyOn(factory, "commitEvents");

      await handler.execute(command);

      expect(commitSpy).toHaveBeenCalledWith([
        expect.objectContaining({
          $data: {
            funds: command.input.funds,
          },
        }),
      ]);
    });
  });
});
