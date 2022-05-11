import { faker } from "@faker-js/faker";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { CreateAccountInput } from "../src/account/dto/create-account.input";
import { AppModule } from "../src/app.module";

describe("Account", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
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
});
