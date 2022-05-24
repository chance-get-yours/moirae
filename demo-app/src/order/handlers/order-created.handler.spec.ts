import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { OrderAggregate } from "../aggregates/order.aggregate";
import { OrderCreatedEvent } from "../events/order-created.event";
import { OrderService } from "../order.service";
import { Order } from "../projections/order.entity";
import { OrderCreatedHandler } from "./order-created.handler";

describe("OrderCreatedHandler", () => {
  let factory: AggregateFactory;
  let handler: OrderCreatedHandler;
  let service: OrderService;

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderCreatedHandler,
        ...mockAggregateFactory(),
        {
          provide: OrderService,
          useFactory: () => ({ save: jest.fn() }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(OrderCreatedHandler);
    service = module.get(OrderService);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let aggregate: OrderAggregate;
    let streamId: string;
    beforeEach(() => {
      streamId = faker.datatype.uuid();
      aggregate = new OrderAggregate(streamId);

      jest.spyOn(factory, "mergeContext").mockResolvedValue(aggregate);
    });

    it("will call service save", async () => {
      const event = new OrderCreatedEvent(streamId, {
        accountId: faker.datatype.uuid(),
        cost: 4,
        inventoryId: faker.datatype.uuid(),
        quantity: 3,
      });

      aggregate.apply(event);

      const order = new Order();
      order.accountId = event.$data.accountId;
      order.cost = event.$data.cost;
      order.id = event.$streamId;
      order.inventoryId = event.$data.inventoryId;
      order.quantity = event.$data.quantity;

      (service.save as jest.Mock).mockResolvedValue(order);

      await handler.execute(event);

      expect(service.save).toHaveBeenCalledWith({
        accountId: aggregate.accountId,
        cost: aggregate.cost,
        createdAt: aggregate.createdAt,
        id: aggregate.id,
        inventoryId: aggregate.inventoryId,
        quantity: aggregate.quantity,
        updatedAt: aggregate.updatedAt,
      });
    });
  });
});
