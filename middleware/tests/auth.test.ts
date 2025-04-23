import request from "supertest";
import app from "../src/server";

global.fetch = vi.fn();

describe("Auth Routes", () => {
	it("GET /auth/login should redirect to Spotify", async () => {
		const res = await request(app).get("/auth/login");

		expect(res.statusCode).toBe(302);
		expect(res.header.location).toContain("https://accounts.spotify.com");
	});

	it("GET /auth/login should return 500 if SPOTIFY_CLIENT_ID is missing", async () => {
		const original = process.env.SPOTIFY_CLIENT_ID;
		delete process.env.SPOTIFY_CLIENT_ID;

		const res = await request(app).get("/auth/login");

		// Restore after test
		process.env.SPOTIFY_CLIENT_ID = original;

		expect(res.statusCode).toBe(500);
		expect(res.text).toContain("Missing SPOTIFY_CLIENT_ID");
	});

	it(`GET /auth/callback without any query should return 400 or error`, async () => {
		const res = await request(app).get("/auth/callback");

		expect(res.statusCode).toBeGreaterThanOrEqual(400); // returns 400
		expect(res.text.toLowerCase()).toContain("missing"); // or "error"
	});

	it(`POST /auth/refresh with missing body should return 400 with matched error message — missing "refresh_token"`, async () => {
		const res = await request(app).post("/auth/refresh").send({}); // No refresh_token

		expect(res.statusCode).toBe(400);
		expect(res.text).toMatch(/missing authorization refresh_token/i);
	});

	it(`POST /auth/refresh with mocked data should return 500 with matched error message — invalid "refresh_token`, async () => {
		const mockedSpotifyAccessFromLocalStorage = {
			bearer: "BQChlO_ol-AGVTRcOHYURFCCylcWX7U27ADwQm7qFzI8iP6UwjGTmZZ9hJDLDyyujjb-lwr0EHWyzTwOPXK98YxjCXorwJKSZPdiBcHlhoxE0Aaz2OiiF_hSz427KQp_egSPBb0Mdt61594ePa4DHSpFAOCU2CzFYsGoMrPduTOeti9PmkuIT4e4LudY8ncXxCoURjsOifqNO4XSO6W3KWjL-dBesLnkBa5xuQ6K1I8NFdcnElTFf1V4-i515OvFxZM7zWSn",
			expiration: "2025-04-23T20:17:34.536Z",
		};

		const res = await request(app).post("/auth/refresh").send({
			refresh_token: mockedSpotifyAccessFromLocalStorage.bearer,
		});

		expect(res.statusCode).toBe(500);
		expect(res.body.error).toMatch("Failed to refresh token");
	});
});

afterEach(() => {
	vi.restoreAllMocks();
});
