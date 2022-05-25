import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { CreateAccountInput } from "../src/account/dto/create-account.input";
import { FundsWithdrawnEvent } from "../src/account/events/funds-withdrawn.event";
import { CreateOrderInput } from "../src/account/order/dto/create-order.input";
import { AppModule } from "../src/app.module";
import { CreateInventoryInput } from "../src/inventory/dto/create-inventory.input";
import { Subscriptions } from "../src/moirae-ws.gateway";
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
          expect(body.success).toEqual(true);
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

    it.todo("will emit a InventoryRemovedEvent");
  });
});
