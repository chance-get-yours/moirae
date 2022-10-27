import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test, TestingModule } from "@nestjs/testing";
import { randomUUID } from "crypto";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { CreateInventoryInput } from "@demo/common";
import { InventoryCreatedFailedEvent } from "@demo/common";
import { InventoryCreatedEvent } from "@demo/common";
import { WsHandler } from "./utilities/ws-handler";

describe("Inventory", () => {
  let app: INestApplication;
  let client: WsHandler;
  let requestorId: string;

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
    requestorId = randomUUID();
    client.send(
      JSON.stringify({
        event: "@moirae/requestor",
        data: { requestorId },
      }),
    );
  });

  afterAll(async () => {
    client.close();
    await app.close();
  });

  describe("create inventory", () => {
    let id: string;
    let failedId: string;
    const input: CreateInventoryInput = {
      name: faker.lorem.word(),
      price: 4,
      quantity: 5,
    };

    it("will create a new inventory item", async () => {
      await request(app.getHttpServer())
        .post("/inventory")
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty("streamId", expect.any(String));
          id = body.streamId;
        });
      client.send(
        JSON.stringify({
          event: "@moirae/id",
          data: { id },
        }),
      );
    });

    it("will emit an event", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$streamId === id && event.$name === InventoryCreatedEvent.name,
      );
      expect(event).toBeDefined();
    });

    it("will not allow two inventory with the same name", async () => {
      await request(app.getHttpServer())
        .post("/inventory")
        .set("x-requestorId", requestorId)
        .send(input)
        .expect(201)
        .then((res) => {
          failedId = res.body.streamId;
        });

      expect(failedId).toBeDefined();
    });

    it("will emit a failed event", async () => {
      const event = await client.awaitMatch(
        (event) =>
          event.$streamId === failedId &&
          event.$name === InventoryCreatedFailedEvent.name,
      );
      expect(event).toBeDefined();
    });
  });
});
