import request from "supertest";
import { app } from "../../src/server";

describe("Me Route", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "testuser", password: "testpass" });
    token = res.body.token;
  });

  it("should return user profile if authenticated", async () => {
    const res = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("testuser");
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app).get("/me");
    expect(res.status).toBe(401);
  });
});
