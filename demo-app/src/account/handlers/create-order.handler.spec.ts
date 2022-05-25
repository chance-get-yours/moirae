import faker from "@faker-js/faker";
import {
  AggregateFactory,
  CommandResponse,
  mockAggregateFactory,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { InventoryAggregate } from "../../inventory/aggregates/inventory.aggregate";
import { InventoryCreatedEvent } from "../../inventory/events/inventory-created.event";
import { AccountAggregate } from "../aggregates/account.aggregate";
import { AccountCreatedEvent } from "../events/account-created.event";
import { CreateOrderCommand } from "../order/commands/create-order.command";
import { CreateOrderHandler } from "./create-order.handler";

describe("CreateOrderHandler", () => {
  let factory: AggregateFactory;
  let handler: CreateOrderHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CreateOrderHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(CreateOrderHandler);

    await factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let account: AccountAggregate;
    let inventory: InventoryAggregate;

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
      inventory = await factory.mergeContext(
        faker.datatype.uuid(),
        InventoryAggregate,
      );
      inventory.apply(
        new InventoryCreatedEvent(inventory.streamId, {
          createdAt: new Date(),
          name: faker.lorem.word(),
          price: 7,
          quantity: 1000,
        }),
      );
      await inventory.commit();
    });

    it("will create a new Order", async () => {
      const command = new CreateOrderCommand({
        accountId: account.id,
        inventoryId: inventory.id,
        quantity: 7,
      });
      command.$correlationId = faker.datatype.uuid();

      const commitSpy = jest.spyOn(factory, "commitEvents");

      expect(await handler.execute(command)).toBeInstanceOf(CommandResponse);

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
      ]);
    });
  });
});
