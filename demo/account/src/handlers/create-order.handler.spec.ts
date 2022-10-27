import { faker } from "@faker-js/faker";
import { AggregateFactory, mockAggregateFactory, QueryBus } from "@moirae/core";
import { Test } from "@nestjs/testing";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { AccountCreatedEvent, IInventory } from "@demo/common";
import { CreateOrderCommand } from "../order/commands/create-order.command";
import { CreateOrderHandler } from "./create-order.handler";

describe("CreateOrderHandler", () => {
  let factory: AggregateFactory;
  let handler: CreateOrderHandler;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        ...mockAggregateFactory(),
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(CreateOrderHandler);
    queryBus = module.get(QueryBus);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let account: AccountAggregate;
    let inventoryId: string;
    let inventory: IInventory;

    beforeEach(async () => {
      account = await factory.mergeContext(
        faker.datatype.uuid(),
        AccountAggregate,
      );
      account.apply(
        new AccountCreatedEvent(account.id, {
          balance: 1000,
          createdAt: new Date(),
          name: faker.lorem.word(),
        }),
      );
      await account.commit();
      inventory = {
        createdAt: new Date(),
        id: inventoryId,
        name: faker.lorem.word(),
        price: 7,
        quantity: 1000,
        updatedAt: new Date(),
      };

      jest.spyOn(queryBus, "execute").mockResolvedValue(inventory);
    });

    it("will create a new Order", async () => {
      const command = new CreateOrderCommand({
        accountId: account.id,
        inventoryId: inventoryId,
        quantity: 7,
      });
      command.$correlationId = faker.datatype.uuid();

      const commitSpy = jest.spyOn(factory, "commitEvents");

      await handler.execute(command);

      expect(commitSpy).toHaveBeenCalledWith([
        expect.objectContaining({
          $correlationId: command.$correlationId,
          $data: {
            accountId: command.input.accountId,
            cost: inventory.price * command.input.quantity,
            id: expect.any(String),
            inventoryId: command.input.inventoryId,
            quantity: command.input.quantity,
          },
        }),
        expect.objectContaining({
          $correlationId: command.$correlationId,
          $data: {
            funds: inventory.price * command.input.quantity * -1,
          },
        }),
      ]);
    });
  });
});
