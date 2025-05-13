import request from "supertest";
import { vi, type Mock } from "vitest";

global.fetch = vi.fn();
const fetchMock = global.fetch as unknown as Mock;

const jsonResponse = (data: any, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

const textResponse = (text: string, status = 400) => ({
  ok: false,
  status,
  text: () => Promise.resolve(text),
  json: () => Promise.resolve({}),
});

beforeAll(() => {
  process.env.MIDDLEWARE_PORT = "6969";
  process.env.SPOTIFY_CLIENT_ID = "client_id";
  process.env.SPOTIFY_CLIENT_SECRET = "client_secret";
  process.env.SPOTIFY_REDIRECT_URI =
    "http://localhost:6969/spotify-auth/callback";
});

afterEach(() => {
  vi.restoreAllMocks();
  fetchMock.mockReset();
});

import app from "../src/server";

const AUTH_PATH = "/spotify-auth";

describe("spotifyAuth routes", () => {
  it("GET /login returns 302 and redirect to Spotify", async () => {
    const res = await request(app).get(`${AUTH_PATH}/login`);
    expect(res.statusCode).toBe(302);
    expect(res.header.location).toContain(
      "https://accounts.spotify.com/authorize"
    );
  });

  it("GET /login with missing client ID returns 500", async () => {
    const original = process.env.SPOTIFY_CLIENT_ID;
    delete process.env.SPOTIFY_CLIENT_ID;

    const res = await request(app).get(`${AUTH_PATH}/login`);

    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/missing spotify_client_id/i);

    process.env.SPOTIFY_CLIENT_ID = original;
  });

  it("GET /callback without code returns 400", async () => {
    const res = await request(app).get(`${AUTH_PATH}/callback`);
    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/missing authorization code/i);
  });

  it("GET /callback happy path returns 302 and redirect with tokens", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ access_token: "access123", expires_in: 3600 })
    );

    const res = await request(app).get(`${AUTH_PATH}/callback?code=abc123`);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(302);
    expect(res.header.location).toContain(
      "http://localhost:3000/spotify-auth/callback"
    );
    expect(res.header.location).toContain("access_token=access123");
  });

  it("GET /callback Spotify error returns 500", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("bad stuff", 400));

    const res = await request(app).get(`${AUTH_PATH}/callback?code=abc123`);

    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/failed to authenticate/i);
  });

  it("POST /refresh without body returns 400", async () => {
    const res = await request(app).post(`${AUTH_PATH}/refresh`).send({});
    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/missing authorization refresh_token/i);
  });

  it("POST /refresh happy returns 200 with JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ access_token: "newAccess", expires_in: 3600 })
    );

    const res = await request(app)
      .post(`${AUTH_PATH}/refresh`)
      .send({ refresh_token: "refresh123" });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ access_token: "newAccess" });
  });

  it("POST /refresh Spotify error returns 500", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));

    const res = await request(app)
      .post(`${AUTH_PATH}/refresh`)
      .send({ refresh_token: "refresh123" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to refresh token/i);
  });
});
