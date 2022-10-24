import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { AccountAggregate } from "../../aggregates/account.aggregate";
import { OrderCreatedEvent } from "../events/order-created.event";
import { RollbackOrderCreatedEvent } from "../events/rollback-order-created.event";
import { OrderService } from "../order.service";
import { Order } from "../projections/order.entity";
import { RollbackOrderCreatedHandler } from "./rollback-order-created.handler";

describe("RollbackOrderCreatedHandler", () => {
  let factory: AggregateFactory;
  let handler: RollbackOrderCreatedHandler;
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
        RollbackOrderCreatedHandler,
        ...mockAggregateFactory(),
        {
          provide: OrderService,
          useFactory: () => ({
            findOne: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
          }),
        },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(RollbackOrderCreatedHandler);
    service = module.get(OrderService);

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

      aggregate.apply(
        new OrderCreatedEvent(streamId, {
          accountId: streamId,
          cost: 9,
          id: faker.datatype.uuid(),
          inventoryId: faker.datatype.uuid(),
          quantity: 1,
        }),
      );
    });

    it("will call service remove", async () => {
      const event = new RollbackOrderCreatedEvent(streamId, {
        id: aggregate.orders[0].id,
      });
      const order = new Order();
      order.id = event.$data.id;

      (service.findOne as jest.Mock).mockResolvedValue(order);

      await handler.execute(event);

      expect(service.remove).toHaveBeenCalledWith(event.$data.id);
    });
  });
});
