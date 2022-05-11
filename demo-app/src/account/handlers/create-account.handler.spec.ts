import { faker } from "@faker-js/faker";
import {
  AggregateFactory,
  CommandResponse,
  mockAggregateFactory,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { CreateAccountCommand } from "../commands/create-account.command";
import { CreateAccountInput } from "../dto/create-account.input";
import { AccountCreatedEvent } from "../events/account-created.event";
import { CreateAccountHandler } from "./create-account.handler";

describe("CreateAccountHandler", () => {
  let factory: AggregateFactory;
  let handler: CreateAccountHandler;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CreateAccountHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(CreateAccountHandler);

    await factory["eventSource"].onModuleInit();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    it("will apply an account created event to the store", async () => {
      const input = new CreateAccountInput();
      input.name = faker.lorem.word();

      const commitSpy = jest.spyOn(factory, "commitEvents");

      expect(
        await handler.execute(new CreateAccountCommand(input)),
      ).toMatchObject<CommandResponse>({
        success: true,
        streamId: expect.any(String),
      });

      expect(commitSpy).toHaveBeenCalledWith([
        new AccountCreatedEvent(expect.any(String), {
          balance: 0,
          createdAt: expect.any(Date),
          name: input.name,
        }),
      ]);
    });
  });
});
