import { QueryBus } from "@moirae/core";
import { INestApplication } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { HelloQuery } from "../src/secondary-app/queries/hello.query";
import { describeIf } from "./utilities/utils";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useWebSocketAdapter(new WsAdapter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });

  describeIf(() => process.env.PUB_TYPE === "rabbitmq")("multi-node", () => {
    it("will test the dummy server", () => {
      return request(global.server).get("/health").expect(200);
    });

    it("will return the query results for a HelloQuery", () => {
      return expect(
        app.get(QueryBus).execute(new HelloQuery()),
      ).resolves.toEqual("Hello World");
    });
  });
});
