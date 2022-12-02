import { faker } from "@faker-js/faker";
import * as request from "supertest";
import { CreateAccountInput } from "@demo/common";
import { FundsWithdrawnEvent } from "@demo/common";
import { RollbackFundsWithdrawnEvent } from "@demo/common";
import { CreateOrderInput } from "@demo/common/src/dto/create-order.input";
import { RollbackOrderCreatedEvent } from "@demo/common";
import { CreateInventoryInput } from "@demo/common";
import { InventoryRemovedEvent } from "@demo/common";
import { Subscriptions } from "@demo/gateway";
import { WsHandler } from "../utilities/ws-handler";
import { Application } from "express";
import { makeDemoApplication } from "../setup/generate-app";
import { randomUUID } from "crypto";

describe("Order", () => {
  let server: Application;
  let close: () => Promise<void>;

  let requestorId: string;
  let client: WsHandler;

  beforeAll(async () => {
    ({ server, close } = await makeDemoApplication());

    client = await WsHandler.fromApp(server);
    requestorId = randomUUID();
    client.send(
      JSON.stringify({
        event: "@moirae/requestor",
        data: { requestorId },
      }),
    );
  });

  afterAll(() => {
    client.close();
    return close && close();
  });

  describe("create and process order", () => {
    let accountId: string;
    let correlationId: string;
    let inventoryId: string;

    afterAll(() => {
      client.clear();
    });

    beforeAll(async () => {
      const createAccountInput: CreateAccountInput = {
        name: faker.lorem.word(),
        balance: 10000,
      };
      await request(server)
        .post("/account")
        .send(createAccountInput)
        .expect(201)
        .expect(({ body }) => {
          accountId = body.streamId;
        });

      const createInventoryInput: CreateInventoryInput = {
        name: faker.lorem.word(),
        price: 4,
        quantity: 5,
      };

      await request(server)
        .post("/inventory")
        .set("x-requestorId", requestorId)
        .send(createInventoryInput)
        .expect(201)
        .expect(({ body }) => {
          inventoryId = body.streamId;
        });

      await client.awaitMatch((event) => event.$streamId === inventoryId);
    });

    it("will create an order", async () => {
      const createOrderInput: CreateOrderInput = {
        accountId,
        inventoryId,
        quantity: 1,
      };

      await request(server)
        .post("/order")
        .send(createOrderInput)
        .expect(201)
        .expect(({ body }) => {
          expect(body.streamId).toBeDefined();
          expect(body.correlationId).toBeDefined();
          correlationId = body.correlationId;
          client.send(
            JSON.stringify({
              event: Subscriptions.CORRELATION,
              data: { correlationId },
            }),
          );
        });
    });

    it("will emit a FundsWithdrawnEvent for the account", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$name === FundsWithdrawnEvent.name &&
          event.$correlationId === correlationId,
      );
      expect(event.$streamId).toEqual(accountId);
    });

    it("will emit a InventoryRemovedEvent", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$name === InventoryRemovedEvent.name &&
          event.$correlationId === correlationId,
      );
      expect(event.$streamId).toEqual(inventoryId);
    });
  });

  describe("create and rollback order", () => {
    let accountId: string;
    let correlationId: string;
    let inventoryId: string;

    beforeAll(async () => {
      const createAccountInput: CreateAccountInput = {
        name: faker.lorem.word(),
        balance: 10000,
      };

      await request(server)
        .post("/account")
        .send(createAccountInput)
        .expect(201)
        .expect(({ body }) => {
          accountId = body.streamId;
        });

      const createInventoryInput: CreateInventoryInput = {
        name: faker.lorem.word(),
        price: 4,
        quantity: 0,
      };

      await request(server)
        .post("/inventory")
        .set("x-requestorId", requestorId)
        .send(createInventoryInput)
        .expect(201)
        .expect(({ body }) => {
          inventoryId = body.streamId;
        });

      await client.awaitMatch((event) => event.$streamId === inventoryId);
    });

    it("will create an order", async () => {
      const createOrderInput: CreateOrderInput = {
        accountId,
        inventoryId,
        quantity: 1,
      };

      await request(server)
        .post("/order")
        .send(createOrderInput)
        .expect(201)
        .expect(({ body }) => {
          expect(body.streamId).toBeDefined();
          expect(body.correlationId).toBeDefined();
          correlationId = body.correlationId;
          client.send(
            JSON.stringify({
              event: Subscriptions.CORRELATION,
              data: { correlationId },
            }),
          );
        });
    });

    it("will emit a FundsWithdrawnEvent", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$name === FundsWithdrawnEvent.name &&
          event.$correlationId === correlationId,
      );
      expect(event).toBeDefined();
    });

    it("will emit a RollbackFundsWithdrawnEvent", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$name === RollbackFundsWithdrawnEvent.name &&
          event.$correlationId === correlationId,
      );
      expect(event).toBeDefined();
    });

    it("will emit a RollbackOrderCreatedEvent", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$name === RollbackOrderCreatedEvent.name &&
          event.$correlationId === correlationId,
      );
      expect(event).toBeDefined();
    });
  });
});
