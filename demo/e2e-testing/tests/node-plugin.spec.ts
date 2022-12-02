import { Application } from "express";
import { makeDemoApplication } from "../setup/generate-app";
import { describeIf } from "../utilities/utils";
import * as request from "supertest";

describe("Node Plugin", () => {
  let close: () => Promise<void>;
  let server: Application;

  beforeAll(async () => {
    ({ close, server } = await makeDemoApplication());
  });

  afterAll(() => {
    return close && close();
  });

  describeIf(() => process.env.PUB_TYPE === "rabbitmq")("multi-node", () => {
    it("will test the dummy server", () => {
      return request(global.server).get("/health").expect(200);
    });

    // it("will return the query results for a HelloQuery", () => {
    //   return expect(
    //     app.get(QueryBus).execute(new HelloQuery()),
    //   ).resolves.toEqual("Hello World");
    // });
  });
});
