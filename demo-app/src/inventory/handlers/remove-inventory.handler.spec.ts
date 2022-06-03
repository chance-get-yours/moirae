import { faker } from "@faker-js/faker";
import {
  AggregateFactory,
  CommandResponse,
  mockAggregateFactory,
} from "@moirae/core";
import { Test } from "@nestjs/testing";
import { InventoryAggregate } from "../aggregates/inventory.aggregate";
import { RemoveInventoryCommand } from "../commands/remove-inventory.command";
import { InventoryCreatedEvent } from "../events/inventory-created.event";
import { RemoveInventoryHandler } from "./remove-inventory.handler";

describe("RemoveInventoryHandler", () => {
  let factory: AggregateFactory;
  let handler: RemoveInventoryHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RemoveInventoryHandler, ...mockAggregateFactory()],
    }).compile();

    factory = module.get(AggregateFactory);
    handler = module.get(RemoveInventoryHandler);

    factory["eventSource"]["onApplicationBootstrap"]();
  });

  it("will be defined", () => {
    expect(handler).toBeDefined();
  });

  describe("execute", () => {
    let inventory: InventoryAggregate;

    beforeEach(async () => {
      const create = new InventoryCreatedEvent(faker.datatype.uuid(), {
        createdAt: new Date(),
        name: faker.lorem.word(),
        price: 1,
        quantity: 1,
      });
      inventory = await factory.mergeContext(
        create.$streamId,
        InventoryAggregate,
      );
      inventory.apply(create);
      await inventory.commit();
    });
    it("will remove inventory from the aggregate", async () => {
      const command = new RemoveInventoryCommand({
        inventoryId: inventory.id,
        orderId: faker.datatype.uuid(),
        quantity: 1,
      });
      command.$correlationId = faker.datatype.uuid();

      const commitSpy = jest.spyOn(factory, "commitEvents");

      expect(await handler.execute(command)).toBeInstanceOf(CommandResponse);
      expect(commitSpy).toHaveBeenCalledWith([
        expect.objectContaining({
          $correlationId: command.$correlationId,
          $data: {
            quantity: command.input.quantity,
          },
        }),
      ]);
    });
  });
});
