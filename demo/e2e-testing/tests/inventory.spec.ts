import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import * as request from "supertest";
import { CreateInventoryInput } from "@demo/common";
import { InventoryCreatedFailedEvent } from "@demo/common";
import { InventoryCreatedEvent } from "@demo/common";
import { WsHandler } from "../utilities/ws-handler";
import { Application } from "express";
import { makeDemoApplication } from "../setup/generate-app";

describe("Inventory", () => {
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

  afterAll(async () => {
    client.close();
    return close && close();
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
      await request(server)
        .post("/inventory")
        .set("x-requestorId", requestorId)
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

      const event = await client.awaitMatch(
        (event) =>
          event.$streamId === id && event.$name === InventoryCreatedEvent.name,
      );
      expect(event).toBeDefined();
    });

    it("will not allow two inventory with the same name", async () => {
      await request(server)
        .post("/inventory")
        .set("x-requestorId", requestorId)
        .send(input)
        .expect(201)
        .then((res) => {
          failedId = res.body.streamId;
        });

      expect(failedId).toBeDefined();
      const event = await client.awaitMatch(
        (event) =>
          event.$streamId === failedId &&
          event.$name === InventoryCreatedFailedEvent.name,
      );
      expect(event).toBeDefined();
    });
  });
});
