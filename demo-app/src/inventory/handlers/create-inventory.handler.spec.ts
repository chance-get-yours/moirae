import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { CreateInventoryCommand } from "../commands/create-inventory.command";
import { InventoryService } from "../inventory.service";
import { CreateInventoryHandler } from "./create-inventory.handler";

describe("CreateInventoryHandler", () => {
  let factory: AggregateFactory;
  let handler: CreateInventoryHandler;
  let service: InventoryService;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateInventoryHandler,
        ...mockAggregateFactory(),
        {
          provide: InventoryService,
          useFactory: () => ({ nameExists: jest.fn() }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(CreateInventoryHandler);
    service = module.get(InventoryService);

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
        price: 1,
      });
      command.$correlationId = faker.datatype.uuid();

      (service.nameExists as jest.Mock).mockResolvedValueOnce(false);
      const commitSpy = jest.spyOn(factory, "commitEvents");
      const streamId = faker.datatype.uuid();

      await handler.execute(command, { streamId });

      expect(commitSpy).toHaveBeenCalledWith([
        expect.objectContaining({
          $data: {
            createdAt: expect.any(Date),
            name: command.input.name,
            price: command.input.price,
            quantity: command.input.quantity,
          },
          $streamId: streamId,
        }),
      ]);
    });
  });
});
