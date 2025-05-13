import request from "supertest";
import { vi, type Mock } from "vitest";

vi.mock("@google/generative-ai", () => {
  const generateContent = vi.fn().mockResolvedValue({
    response: {
      text: vi
        .fn()
        .mockResolvedValue(
          "Chill:25, Energetic:20, Melancholy:15, Romantic:10, Confident:8, Nostalgic:7, Artsy:6, Dark:5, Rage:3, Futuristic:1"
        ),
    },
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({ generateContent }),
    })),
  };
});

global.fetch = vi.fn();
const fetchMock = global.fetch as unknown as Mock;

const jsonResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
});

const profileData = { display_name: "TestUser", id: "user‑123" };
const topTracksData = {
  items: Array.from({ length: 10 }).map((_, i) => ({
    id: `track${i}`,
    name: `Song ${i}`,
    artists: [{ name: "Artist" }],
    duration_ms: 180_000,
  })),
};

import app from "../src/server";

const AUTH_HEADER = { Authorization: "Bearer validToken" };

describe("me.ts routes", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("GET /me/profile without token returns 401", async () => {
    const res = await request(app).get("/me/profile");
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/missing access token/i);
  });

  it("GET /me/profile with token returns 200 along with user JSON", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(profileData));

    const res = await request(app).get("/me/profile").set(AUTH_HEADER);
    expect(res.statusCode).toBe(200);
    expect(res.body.display_name).toBe("TestUser");
  });

  it("GET /me/items with invalid type returns 400", async () => {
    const res = await request(app).get("/me/items?type=foo").set(AUTH_HEADER);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid type/i);
  });

  it("GET /me/top-vibes without token returns 401", async () => {
    const res = await request(app).get("/me/top-vibes?time_range=short_term");
    expect(res.statusCode).toBe(401);
  });

  it("GET /me/top-vibes with invalid time_range returns 400", async () => {
    const res = await request(app)
      .get("/me/top-vibes?time_range=bad")
      .set(AUTH_HEADER);
    expect(res.statusCode).toBe(400);
  });

  it("GET /me/top-vibes happy returns 200 with vibes", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(profileData))
      .mockResolvedValueOnce(jsonResponse(topTracksData));

    const res = await request(app)
      .get("/me/top-vibes?time_range=short_term")
      .set(AUTH_HEADER);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const vibes = res.body.vibes as Record<string, number>;
    expect(Object.keys(vibes)).toHaveLength(10);
    expect(vibes).toHaveProperty("Chill");
    expect(vibes).toHaveProperty("Energetic");

    const total = Object.values(vibes).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
