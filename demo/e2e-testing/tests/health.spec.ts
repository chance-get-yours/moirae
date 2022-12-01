import { Application } from "express";
import * as request from "supertest";
import { makeDemoApplication } from "../setup/generate-app";

describe("Health", () => {
  let server: Application;
  let close: () => Promise<void>;

  beforeAll(async () => {
    ({ server, close } = await makeDemoApplication());
  });

  afterAll(() => {
    return close && close();
  });

  it("will run the primary server correctly", () => {
    return request(server).get("/health").expect(200);
  });

  it("will run the second server correctly", () => {
    return request(global.server).get("/health").expect(200);
  });
});
