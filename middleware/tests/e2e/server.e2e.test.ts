import request from "supertest";
import { app } from "../../src/server";

describe("Server", () => {
  it("should respond to root route or 404 otherwise", async () => {
    const res = await request(app).get("/");
    expect([200, 404]).toContain(res.status);
  });
});
