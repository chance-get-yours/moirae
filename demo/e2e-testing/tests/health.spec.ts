import * as request from "supertest";

describe("Health", () => {
  it("will run the second server correctly", () => {
    return request(global.server).get("/health").expect(200);
  });
});
