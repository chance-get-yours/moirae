import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { CreateInventoryInput } from "../src/inventory/dto/create-inventory.input";
import { InventoryCreatedEvent } from "../src/inventory/events/inventory-created.event";
import { WsHandler } from "./utilities/ws-handler";

describe("Inventory", () => {
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

  describe("create inventory", () => {
    let id: string;
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
          // expect(body).toHaveProperty("success", true);
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
        .send(input)
        .expect(201);

      // TODO: Add wait for event
    });
  });
});
