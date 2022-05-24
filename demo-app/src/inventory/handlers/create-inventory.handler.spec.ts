import { faker } from "@faker-js/faker";
import {
  AggregateFactory,
  CommandResponse,
  mockAggregateFactory,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { CreateInventoryCommand } from "../commands/create-inventory.command";
import { CreateInventoryHandler } from "./create-inventory.handler";

describe("CreateInventoryHandler", () => {
  let factory: AggregateFactory;
  let handler: CreateInventoryHandler;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CreateInventoryHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(CreateInventoryHandler);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    it("will create a new inventory item", async () => {
      const command = new CreateInventoryCommand({
        name: faker.lorem.word(),
        quantity: 4,
      });
      command.$correlationId = faker.datatype.uuid();

      const commitSpy = jest.spyOn(factory, "commitEvents");

      expect(await handler.execute(command)).toMatchObject<CommandResponse>({
        correlationId: command.$correlationId,
        success: true,
        streamId: expect.any(String),
      });

      expect(commitSpy).toHaveBeenCalledWith([
        expect.objectContaining({
          $data: {
            createdAt: expect.any(Date),
            name: command.input.name,
            quantity: command.input.quantity,
          },
        }),
      ]);
    });
  });
});
