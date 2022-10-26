import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { CreateAccountInput } from "@demo/common";
import { FundsWithdrawnEvent } from "@demo/common";
import { RollbackFundsWithdrawnEvent } from "@demo/common";
import { CreateOrderInput } from "@demo/common/src/dto/create-order.input";
import { RollbackOrderCreatedEvent } from "@demo/common";
import { AppModule } from "../src/app.module";
import { CreateInventoryInput } from "@demo/common";
import { InventoryRemovedEvent } from "@demo/common";
import { Subscriptions } from "@demo/gateway";
import { WsHandler } from "./utilities/ws-handler";

describe("Order", () => {
  let app: INestApplication;
  let client: WsHandler;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();

    client = await WsHandler.fromApp(app);
  });

  afterAll(async () => {
    client.close();
    await app.close();
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
      await request(app.getHttpServer())
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

      await request(app.getHttpServer())
        .post("/inventory")
        .send(createInventoryInput)
        .expect(201)
        .expect(({ body }) => {
          inventoryId = body.streamId;
        });
    });

    it("will create an order", async () => {
      const createOrderInput: CreateOrderInput = {
        accountId,
        inventoryId,
        quantity: 1,
      };

      await request(app.getHttpServer())
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

      await request(app.getHttpServer())
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

      await request(app.getHttpServer())
        .post("/inventory")
        .send(createInventoryInput)
        .expect(201)
        .expect(({ body }) => {
          inventoryId = body.streamId;
        });
    });

    it("will create an order", async () => {
      const createOrderInput: CreateOrderInput = {
        accountId,
        inventoryId,
        quantity: 1,
      };

      await request(app.getHttpServer())
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
