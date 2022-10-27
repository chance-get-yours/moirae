import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { InventoryCreatedEvent } from "@demo/common";
import { InventoryService } from "../inventory.service";
import { Inventory } from "../projections/inventory.entity";
import { InventoryCreatedHandler } from "./inventory-created.handler";

describe("InventoryCreatedHandler", () => {
  let factory: AggregateFactory;
  let handler: InventoryCreatedHandler;
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
        InventoryCreatedHandler,
        ...mockAggregateFactory(),
        {
          provide: InventoryService,
          useFactory: () => ({ save: jest.fn() }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(InventoryCreatedHandler);
    service = module.get(InventoryService);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let aggregate: InventoryAggregate;
    let streamId: string;
    beforeEach(() => {
      streamId = faker.datatype.uuid();
      aggregate = new InventoryAggregate(streamId);
      aggregate["_cacheController"] = factory["cache"];

      jest.spyOn(factory, "mergeContext").mockResolvedValue(aggregate);
    });

    it("will call service save", async () => {
      const event = new InventoryCreatedEvent(streamId, {
        createdAt: new Date(),
        name: faker.lorem.word(),
        price: 3,
        quantity: 3,
      });

      aggregate.apply(event);

      const inventory = new Inventory();
      inventory.createdAt = aggregate.createdAt;
      inventory.id = aggregate.id;
      inventory.name = aggregate.name;
      inventory.quantity = aggregate.quantity;
      inventory.updatedAt = aggregate.updatedAt;

      (service.save as jest.Mock).mockResolvedValue(inventory);

      await handler.execute(event);

      expect(service.save).toHaveBeenCalledWith({
        id: aggregate.id,
        createdAt: aggregate.createdAt,
        name: aggregate.name,
        price: aggregate.price,
        quantity: aggregate.quantity,
        updatedAt: aggregate.updatedAt,
      });
    });
  });
});
