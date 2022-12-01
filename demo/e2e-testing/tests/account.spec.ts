import { faker } from "@faker-js/faker";
import * as request from "supertest";
import { CreateAccountInput } from "@demo/common";
import { DepositFundsInput } from "@demo/common";
import { WithdrawFundsInput } from "@demo/common";
import { FundsWithdrawalFailedEvent } from "@demo/common";
import { FundsWithdrawnEvent } from "@demo/common";
import { Subscriptions } from "@demo/gateway";
import { randomUUID } from "crypto";
import { makeDemoApplication } from "../setup/generate-app";
import { WsHandler } from "../utilities/ws-handler";
import { Application } from "express";

describe("Account", () => {
  let server: Application;
  let close: () => Promise<void>;

  let requestorId: string;
  let wsClient: WsHandler;

  beforeAll(async () => {
    ({ server, close } = await makeDemoApplication());

    wsClient = await WsHandler.fromApp(server);
    requestorId = randomUUID();
    wsClient.send(
      JSON.stringify({
        event: "@moirae/requestor",
        data: { requestorId },
      }),
    );
  });

  afterAll(() => {
    wsClient.close();
    return close && close();
  });

  describe("create account", () => {
    afterAll(() => {
      wsClient.clear();
    });
    it("will create an account", async () => {
      const input: CreateAccountInput = {
        name: faker.lorem.word(),
      };

      await request(server)
        .post("/account")
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty("streamId", expect.any(String));
        });
    });
  });

  describe("deposit funds", () => {
    let id: string;

    afterAll(() => {
      wsClient.clear();
    });

    beforeAll(async () => {
      const input: CreateAccountInput = {
        name: faker.lorem.word(),
      };
      await request(server)
        .post("/account")
        .set("x-requestorId", requestorId)
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          id = body.streamId;
          wsClient.send(
            JSON.stringify({
              event: Subscriptions.ID,
              data: { id },
            }),
          );
        });
      await wsClient.awaitMatch(
        (event) =>
          event.$name === "AccountCreatedEvent" && event.$streamId === id,
      );
    });

    it("will deposit new funds in the account", async () => {
      const input: DepositFundsInput = {
        accountId: id,
        funds: faker.datatype.number({ min: 0 }),
      };

      await request(server)
        .put("/account/deposit")
        .send(input)
        .expect(200)
        .expect(({ body }) => {
          id = body.streamId;
        });
    });

    it("will block depositing a negative amount", async () => {
      const input: DepositFundsInput = {
        accountId: id,
        funds: -2,
      };

      await request(server).put("/account/deposit").send(input).expect(400);
    });
  });

  describe("find account by id", () => {
    let id: string;

    afterAll(() => {
      wsClient.clear();
    });

    beforeAll(async () => {
      const input: CreateAccountInput = {
        name: faker.lorem.word(),
      };
      await request(server)
        .post("/account")
        .set("x-requestorId", requestorId)
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          id = body.streamId;
          wsClient.send(
            JSON.stringify({
              event: Subscriptions.ID,
              data: { id },
            }),
          );
        });
      await wsClient.awaitMatch(
        (event) =>
          event.$name === "AccountCreatedEvent" && event.$streamId === id,
      );
    });

    it("will find a created account", async () => {
      await request(server)
        .get(`/account/${id}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            id,
            balance: 0,
          });
        });
    });
  });

  describe("withdraw funds", () => {
    let id: string;

    afterAll(() => {
      wsClient.clear();
    });

    beforeEach(async () => {
      const input: CreateAccountInput = {
        name: faker.lorem.word(),
        balance: 100,
      };
      await request(server)
        .post("/account")
        .set("x-requestorId", requestorId)
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          id = body.streamId;
          wsClient.send(
            JSON.stringify({
              event: Subscriptions.ID,
              data: { id },
            }),
          );
        });
      await wsClient.awaitMatch(
        (event) =>
          event.$name === "AccountCreatedEvent" && event.$streamId === id,
      );
    });

    it("will fail if account would go to a negative balance", async () => {
      const input: WithdrawFundsInput = {
        accountId: id,
        funds: -101,
      };

      await request(server).put("/account/withdraw").send(input).expect(200);

      const event = await wsClient.awaitMatch(
        (event) =>
          event.$streamId === id &&
          event.$name === FundsWithdrawalFailedEvent.name,
      );
      expect(event).toBeDefined();
    });

    it("will remove funds from the account", async () => {
      const input: WithdrawFundsInput = {
        accountId: id,
        funds: -10,
      };

      await request(server)
        .put("/account/withdraw")
        .send(input)
        .expect(200)
        .expect(({ body }) => {
          expect(body.streamId).toEqual(id);
        });

      const event = await wsClient.awaitMatch(
        (event) =>
          event.$name === FundsWithdrawnEvent.name && event.$streamId === id,
      );
      expect(event).toBeDefined();
    });
  });
});
