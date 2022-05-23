import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { WithdrawFundsCommand } from "../commands/withdraw-funds.command";
import { AccountCreatedEvent } from "../events/account-created.event";
import { WithdrawFundsHandler } from "./withdraw-funds.handler";

describe("WithdrawFundsHandler", () => {
  let factory: AggregateFactory;
  let handler: WithdrawFundsHandler;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WithdrawFundsHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(WithdrawFundsHandler);

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
        balance: 10000,
        createdAt: new Date(),
        name: faker.lorem.word(),
      });
      await factory.commitEvents([create]);
    });

    it("will apply the event to the aggregate", async () => {
      const command = new WithdrawFundsCommand({
        accountId: streamId,
        funds: faker.datatype.number({ min: 1, max: 1000 }) * -1,
      });

      const commitSpy = jest.spyOn(factory, "commitEvents");

      expect(await handler.execute(command)).toMatchObject({
        streamId,
        success: true,
      });

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
