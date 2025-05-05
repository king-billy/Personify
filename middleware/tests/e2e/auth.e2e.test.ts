/// <reference types="jest" />
import request from "supertest";
import { app } from "../../src/server";

describe("Auth Routes", () => {
  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "testuser", password: "testpass" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should fail login with invalid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "wrong", password: "wrong" });

    expect(res.status).toBe(401);
  });
});
