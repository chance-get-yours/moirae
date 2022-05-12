import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from "supertest";
import { CreateAccountInput } from "../src/account/dto/create-account.input";
import { Account } from "../src/account/projections/account.entity";
import { AppModule } from "../src/app.module";

describe("Account", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("create account", () => {
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

  describe("find account by id", () => {
    let id: string;

    beforeAll(async () => {
      const input: CreateAccountInput = {
        name: faker.lorem.word(),
      };

      ({ id } = await app.get(getRepositoryToken(Account)).save({
        ...input,
        balance: 0,
        createdAt: new Date(),
        id: faker.datatype.uuid(),
        updatedAt: new Date(),
      }));
    });

    it("will find a created account", async () => {
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
});
