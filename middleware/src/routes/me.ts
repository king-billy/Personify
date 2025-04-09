import { Request, Response, Router } from "express";

const router = Router();

/**
 *
 * @param token
 * @description Utility: helper to attach Authorization header
 *              - Needs Bearer Token
 * @returns
 */
const createAuthHeader = (token: string) => ({
	Authorization: `Bearer ${token}`,
});

/**
 * @route   GET /me/profile
 * @description Get current Spotify user's profile information
 *              - Needs Bearer Token
 * @returns
 */
router.get("/profile", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	try {
		const response = await fetch("https://api.spotify.com/v1/me", {
			headers: createAuthHeader(token),
		});

		const data = await response.json();

		if (!response.ok) throw new Error(data.error?.message || "Failed to fetch profile");

		res.json(data);
	} catch (error: any) {
		console.error("Profile fetch error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /me/top-artists
 * @description Get the authenticated user's top artists
 *              based on their own listening history
 *              - Optional query params: limit, time_range
 *              - Needs Bearer Token
 * @example /me/top-artists?limit=10&time_range=short_term
 */
router.get("/top-artists", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const limit = parseInt(req.query.limit as string) || 20;
	const time_range = (req.query.time_range as string) || "medium_term"; // short_term, medium_term, long_term

	try {
		const url = `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=${limit}`;
		const response = await fetch(url, {
			headers: createAuthHeader(token),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error?.message || "Failed to fetch top artists");
		}

		res.json(data);
	} catch (error: any) {
		console.error("Top artists error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /me/top-tracks
 * @description Get the authenticated user's top tracks
 *              based on their own listening history
 *              - Optional query params: limit, time_range
 *              - Needs Bearer Token
 * @example /me/top-tracks?limit=15&time_range=long_term
 */
router.get("/top-tracks", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const limit = parseInt(req.query.limit as string) || 20;
	const time_range = (req.query.time_range as string) || "medium_term";

	try {
		const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}`;
		const response = await fetch(url, {
			headers: createAuthHeader(token),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error?.message || "Failed to fetch top tracks");
		}

		res.json(data);
	} catch (error: any) {
		console.error("Top tracks error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

export default router;
