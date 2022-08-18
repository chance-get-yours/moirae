import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { CreateAccountInput } from "../src/account/dto/create-account.input";
import { DepositFundsInput } from "../src/account/dto/deposit-funds.input";
import { WithdrawFundsInput } from "../src/account/dto/withdraw-funds.input";
import { FundsWithdrawnEvent } from "../src/account/events/funds-withdrawn.event";
import { AppModule } from "../src/app.module";
import { Subscriptions } from "../src/moirae-ws.gateway";
import { WsHandler } from "./utilities/ws-handler";

describe("Account", () => {
  let app: INestApplication;
  let wsClient: WsHandler;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();

    wsClient = await WsHandler.fromApp(app);
  });

  afterAll(async () => {
    wsClient.close();
    await app.close();
  });

  describe("create account", () => {
    afterAll(() => {
      wsClient.clear();
    });
    it("will create an account", async () => {
      const input: CreateAccountInput = {
        name: faker.lorem.word(),
      };

      await request(app.getHttpServer())
        .post("/account")
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty("success", true);
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
      await request(app.getHttpServer())
        .post("/account")
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          id = body.streamId;
        });
      wsClient.send(
        JSON.stringify({
          event: Subscriptions.ID,
          data: { id },
        }),
      );
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

      await request(app.getHttpServer())
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

      await request(app.getHttpServer())
        .put("/account/deposit")
        .send(input)
        .expect(400);
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
      await request(app.getHttpServer())
        .post("/account")
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
      await new Promise<void>((res) => setTimeout(() => res(), 1000));
      await request(app.getHttpServer())
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
      await request(app.getHttpServer())
        .post("/account")
        .send(input)
        .expect(201)
        .expect(({ body }) => {
          id = body.streamId;
        });
      wsClient.send(
        JSON.stringify({
          event: Subscriptions.ID,
          data: { id },
        }),
      );
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

      await request(app.getHttpServer())
        .put("/account/withdraw")
        .send(input)
        .expect(500);
    });

    it("will remove funds from the account", async () => {
      const input: WithdrawFundsInput = {
        accountId: id,
        funds: -10,
      };

      await request(app.getHttpServer())
        .put("/account/withdraw")
        .send(input)
        .expect(200)
        .expect(({ body }) => {
          expect(body.success).toEqual(true);
        });

      const event = await wsClient.awaitMatch(
        (event) =>
          event.$name === FundsWithdrawnEvent.name && event.$streamId === id,
      );
      expect(event).toBeDefined();
    });
  });
});
