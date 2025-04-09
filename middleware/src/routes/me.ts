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
 * @description Get user's top artists (last 6 months)
 *              - Needs Bearer Token
 * @returns
 */
router.get("/top-artists", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	try {
		const response = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=20", {
			headers: createAuthHeader(token),
		});
		const data = await response.json();

		if (!response.ok) throw new Error(data.error?.message || "Failed to fetch top artists");

		res.json(data);
	} catch (error: any) {
		console.error("Top artists error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /me/top-tracks
 * @description Get user's top tracks (last 6 months)
 *              - Needs Bearer Token
 * @returns
 */
router.get("/top-tracks", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	try {
		const response = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=20", {
			headers: createAuthHeader(token),
		});
		const data = await response.json();

		if (!response.ok) throw new Error(data.error?.message || "Failed to fetch top tracks");

		res.json(data);
	} catch (error: any) {
		console.error("Top tracks error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

export default router;
