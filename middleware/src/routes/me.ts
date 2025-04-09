import { Request, Response, Router } from "express";

const router = Router();

/**
 *
 * @param token
 * @desc Utility: helper to attach Authorization header
 *              - Needs Bearer Token
 * @returns
 */
const createAuthHeader = (token: string) => ({
	Authorization: `Bearer ${token}`,
});

/**
 * @route   GET /me/profile
 * @desc Get current Spotify user's profile information
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
 * @route   GET /me/items
 * @desc    Get user's artists or tracks
 * @query   type: "artists" or "tracks"
 *          limit: optional (default 20)
 *          time_range: optional (default medium_term)
 */
router.get("/items", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const type = (req.query.type as "artists" | "tracks") || "tracks";
	const limit = parseInt(req.query.limit as string) || 20;

	if (!["artists", "tracks"].includes(type)) {
		res.status(400).json({ error: "Invalid type. Use 'artists' or 'tracks'." });
		return;
	}

	const headers = createAuthHeader(token);

	try {
		if (type === "tracks") {
			// Fetch from both recently played and saved tracks
			const [recent, saved] = await Promise.all([
				fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", { headers }),
				fetch("https://api.spotify.com/v1/me/tracks?limit=50", { headers }),
			]);

			const recentData = await recent.json();
			const savedData = await saved.json();

			const combinedTracks = [
				...(recentData.items?.map((item: any) => item.track) || []),
				...(savedData.items?.map((item: any) => item.track) || []),
			];

			// De-dupe by track ID
			const uniqueTracksMap = new Map();
			for (const track of combinedTracks) {
				if (!uniqueTracksMap.has(track.id)) {
					uniqueTracksMap.set(track.id, track);
				}
			}

			const tracks = Array.from(uniqueTracksMap.values()).slice(0, limit);
			res.json({ items: tracks, total: tracks.length });
		}

		if (type === "artists") {
			// Fetch followed artists
			const followed = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", { headers });
			const followedData = await followed.json();

			// Extract artists from recently played and saved tracks
			const [recent, saved] = await Promise.all([
				fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", { headers }),
				fetch("https://api.spotify.com/v1/me/tracks?limit=50", { headers }),
			]);

			const recentData = await recent.json();
			const savedData = await saved.json();

			const artistsFromTracks = [
				...(recentData.items?.map((item: any) => item.track.artists).flat() || []),
				...(savedData.items?.map((item: any) => item.track.artists).flat() || []),
			];

			const combinedArtists = [...(followedData.artists?.items || []), ...artistsFromTracks];

			// De-dupe by artist ID
			const uniqueArtistMap = new Map();
			for (const artist of combinedArtists) {
				if (!uniqueArtistMap.has(artist.id)) {
					uniqueArtistMap.set(artist.id, artist);
				}
			}

			const artists = Array.from(uniqueArtistMap.values()).slice(0, limit);
			res.json({ items: artists, total: artists.length });
		}
	} catch (error: any) {
		console.error("Items route error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /me/followed-artists
 * @desc    Get artists followed by the user
 */
router.get("/followed-artists", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const limit = parseInt(req.query.limit as string) || 20;

	try {
		const response = await fetch(`https://api.spotify.com/v1/me/following?type=artist&limit=${limit}`, {
			headers: createAuthHeader(token),
		});

		const data = await response.json();

		if (!response.ok) throw new Error(data.error?.message || "Failed to fetch followed artists");

		res.json(data.artists || data);
	} catch (err: any) {
		console.error("Followed artists error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /user/followed-playlists
 * @desc    Get playlists the user follows (in their library)
 */
router.get("/followed-playlists", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const limit = parseInt(req.query.limit as string) || 20;

	try {
		const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
			headers: createAuthHeader(token),
		});
		const data = await response.json();

		if (!response.ok) throw new Error(data.error?.message || "Failed to fetch followed playlists");

		res.json(data);
	} catch (err: any) {
		console.error("Followed playlists error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

export default router;
