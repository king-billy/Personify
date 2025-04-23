import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response, Router } from "express";

// Load environment variables
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

export const config = {
	spotify: {
		clientId: process.env.SPOTIFY_CLIENT_ID,
		clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		redirectUri: process.env.REDIRECT_URI,
	},
	gemini: {
		apiKey: process.env.GEMINI_API_KEY,
	},
	port: process.env.MIDDLEWARE_PORT || 6969,
};

/**
 * Classify user's top tracks into vibes using Gemini
 * @param {string} token - Spotify access token
 * @param {string} timeRange - Time range for top tracks ("short_term", "medium_term", "long_term")
 * @returns {Promise<Record<string, number>>} Object with vibe percentages
 */
async function classifyVibes(token: string, timeRange: string = "short_term"): Promise<Record<string, number>> {
	console.log("Starting vibe classification with time range:", timeRange);

	try {
		// Verify token first with a simple request
		const testResponse = await fetch("https://api.spotify.com/v1/me", {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!testResponse.ok) {
			const errorData = await testResponse.json();
			throw new Error(`Token validation failed: ${errorData.error?.message || "Invalid token"}`);
		}

		console.log("Fetching top tracks from Spotify...");
		const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log("Spotify API response status:", response.status);

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Spotify API Error Details:", errorData);
			throw new Error(`Failed to fetch top tracks: ${errorData.error?.message || response.statusText}`);
		}

		const topTracks = await response.json();
		console.log(`Found ${topTracks.items?.length || 0} tracks`);

		if (!topTracks.items || topTracks.items.length === 0) {
			throw new Error("No tracks found for the specified time range");
		}

		// Prepare track information
		const trackSummary = topTracks.items.map((track: any) => `- ${track.name} by ${track.artists[0]?.name || "Unknown Artist"}`).join("\n");

		const prompt = `
    Analyze these songs and identify the top 5 dominant vibes with percentages:
    ${trackSummary}
  
  VIBE OPTIONS (choose ONLY these exact names):
  1. Chill 
  2. Energetic 
  3. Melancholy
  4. Romantic
  5. Confident
  6. Nostalgic
  7. Artsy
  8. Dark
  9. Rage
  10. Futuristic
  11. Party
  12. Ambient
  13. Spiritual
  14. Dreamy
  15. Rebellious
  16. Carefree
  17. Classy
  18. Cinematic
  19. Theatrical
  20. Alternative
  
  RESPONSE FORMAT (must follow exactly):
  Chill:45, Energetic:30, Melancholy:25, Romantic:15, Confident:10
  
  Rules:
  - Only use the provided vibe names
  - Percentages must sum to 100
  - Include exactly 5 vibes
  - No additional text or explanation
`;

		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const result = await model.generateContent(prompt);
		const responseText = await result.response.text();

		// Parse the response
		const vibeDict: Record<string, number> = {};
		const pairs = responseText.trim().split(",");

		for (const pair of pairs) {
			if (pair.includes(":")) {
				const [vibe, percent] = pair.split(":").map((s) => s.trim());
				if (vibe && percent && !isNaN(Number(percent))) {
					vibeDict[vibe] = Number(percent);
				}
			}
		}

		// Validate response
		if (Object.keys(vibeDict).length === 5 && Object.values(vibeDict).reduce((a, b) => a + b, 0) === 100) {
			return vibeDict;
		} else {
			console.warn("Invalid format from Gemini, using fallback");
			return {
				Chill: 0,
				Energetic: 0,
				Romantic: 0,
				Dark: 0,
				Cinematic: 0,
			};
		}
	} catch (error: any) {
		console.error(`Error in classifyVibes: ${error.message}`);
		console.error(error.stack);
		return {
			Chill: 1,
			Energetic: 1,
			Romantic: 1,
			Dark: 1,
			Cinematic: 1,
		};
	}
}

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
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
				fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
					headers,
				}),
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
				fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
					headers,
				}),
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

/**
 * @route   GET /me/song-count
 * @desc    Count number of unique songs from recently played and saved tracks
 */
router.get("/song-count", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const range = (req.query.range as string) || "daily";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const headers = createAuthHeader(token);

	// Date range filter
	const now = Date.now();
	const rangeMap: Record<string, number> = {
		daily: 1,
		week: 7,
		month: 30,
		year: 365,
	};
	const cutoff = now - rangeMap[range] * 24 * 60 * 60 * 1000;

	try {
		const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", { headers });
		const recentData = await recent.json();

		const filteredTracks = (recentData.items || []).filter((item: any) => new Date(item.played_at).getTime() >= cutoff);

		const uniqueTracks = new Map();
		for (const item of filteredTracks) {
			const track = item.track;
			if (track && !uniqueTracks.has(track.id)) {
				uniqueTracks.set(track.id, track);
			}
		}

		res.json({ count: uniqueTracks.size });
	} catch (err: any) {
		console.error("Song count error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /me/artist-count
 * @desc    Count number of unique artists from followed + recent/saved tracks
 */
router.get("/artist-count", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const range = (req.query.range as string) || "daily";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const headers = createAuthHeader(token);
	const now = Date.now();
	const rangeMap: Record<string, number> = {
		daily: 1,
		week: 7,
		month: 30,
		year: 365,
	};
	const cutoff = now - rangeMap[range] * 24 * 60 * 60 * 1000;

	try {
		const [followed, recent] = await Promise.all([
			fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", {
				headers,
			}),
			fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
				headers,
			}),
		]);
	} catch (e) {}
	try {
		const [followed, recent] = await Promise.all([
			fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", {
				headers,
			}),
			fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
				headers,
			}),
		]);

		const followedData = await followed.json();
		const recentData = await recent.json();

		const artistsFromTracks = (recentData.items || [])
			.filter((item: any) => new Date(item.played_at).getTime() >= cutoff)
			.map((item: any) => item.track.artists)
			.flat();

		const combinedArtists = [...(followedData.artists?.items || []), ...artistsFromTracks];

		const uniqueArtists = new Map();
		for (const artist of combinedArtists) {
			if (!uniqueArtists.has(artist.id)) {
				uniqueArtists.set(artist.id, artist);
			}
		}

		res.json({ count: uniqueArtists.size });
	} catch (err: any) {
		console.error("Artist count error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /me/genre-count
 * @desc    Count number of unique genres from top artists
 */
router.get("/genre-count", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const range = (req.query.range as string) || "daily";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const headers = createAuthHeader(token);

	const timeRangeMap: Record<string, string> = {
		daily: "short_term",
		week: "short_term",
		month: "medium_term",
		year: "long_term",
	};
	const time_range = timeRangeMap[range] || "short_term";

	try {
		const response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${time_range}`, { headers });
		const data = await response.json();

		const genres = new Set<string>();
		for (const artist of data.items || []) {
			for (const genre of artist.genres || []) {
				genres.add(genre);
			}
		}

		res.json({ count: genres.size });
	} catch (err: any) {
		console.error("Genre count error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /me/minutes-played
 * @desc    Estimate total listening time from top tracks
 */
router.get("/minutes-played", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const range = (req.query.range as string) || "daily";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	const headers = createAuthHeader(token);

	const timeRangeMap: Record<string, string> = {
		daily: "short_term",
		week: "short_term",
		month: "medium_term",
		year: "long_term",
	};
	const time_range = timeRangeMap[range] || "short_term";

	try {
		const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${time_range}`, { headers });
		const data = await response.json();

		const totalDurationMs = (data.items || []).reduce((sum: number, track: any) => sum + track.duration_ms, 0);

		const totalMinutes = Math.floor(totalDurationMs / 60000);

		res.json({ estimated_minutes_played: totalMinutes });
	} catch (err: any) {
		console.error("Minutes played error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /me/top-artists
 * @desc    Returns top 5 most frequent artists from recently played and saved tracks
 */
router.get("/top-artists", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const range = (req.query.range as string) || "daily";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	try {
		const headers = createAuthHeader(token);

		// date filtering for recently played
		const now = Date.now();
		const rangeMap: Record<string, number> = {
			daily: 1,
			week: 7,
			month: 30,
			year: 365,
		};
		const cutoff = now - rangeMap[range] * 24 * 60 * 60 * 1000;

		// Fetch data
		const [recent, saved] = await Promise.all([
			fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
				headers,
			}),
			fetch("https://api.spotify.com/v1/me/tracks?limit=50", { headers }),
		]);

		const recentData = await recent.json();
		const savedData = await saved.json();

		// Filter recent tracks by time
		const filteredRecent = (recentData.items || []).filter((item: any) => new Date(item.played_at).getTime() >= cutoff);

		const allArtists = [...filteredRecent, ...(savedData.items || [])].map((item: any) => item.track?.artists || []).flat();

		// Count frequency
		const artistMap: Record<string, { name: string; count: number; image: string }> = {};

		for (const artist of allArtists) {
			if (!artist?.id) continue;

			if (!artistMap[artist.id]) {
				artistMap[artist.id] = {
					name: artist.name,
					count: 1,
					image: artist.images?.[0]?.url || "",
				};
			} else {
				artistMap[artist.id].count += 1;
			}
		}

		// Fetch full artist info to ensure image
		const artistIds = Object.keys(artistMap).slice(0, 50);
		if (artistIds.length > 0) {
			const fullArtistData = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`, { headers });
			const { artists } = await fullArtistData.json();

			for (const artist of artists) {
				if (artistMap[artist.id]) {
					artistMap[artist.id].image = artist.images?.[0]?.url || "";
				}
			}
		}

		const topArtists = Object.values(artistMap)
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		res.json({ top: topArtists });
	} catch (err: any) {
		console.error("Top artists error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /me/top-genres
 * @desc    Returns top 5 genres from user's top artists
 */
router.get("/top-genres", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const range = (req.query.range as string) || "daily";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	try {
		const headers = createAuthHeader(token);

		const timeRangeMap: Record<string, string> = {
			daily: "short_term",
			week: "short_term",
			month: "medium_term",
			year: "long_term",
		};

		const time_range = timeRangeMap[range] || "short_term";

		const response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${time_range}`, { headers });
		const data = await response.json();

		const genreFrequency: Record<string, number> = {};

		for (const artist of data.items || []) {
			for (const genre of artist.genres || []) {
				genreFrequency[genre] = (genreFrequency[genre] || 0) + 1;
			}
		}

		const topGenres = Object.entries(genreFrequency)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([genre, count]) => ({ genre, count }));

		res.json({ top: topGenres });
	} catch (err: any) {
		console.error("Top genres error:", err.message);
		res.status(500).json({ error: err.message });
	}
});

/**
 * @route   GET /me/top-vibes
 * @desc    Returns user's music vibe classification
 * @query   time_range: optional ("short_term", "medium_term", "long_term")
 */
/**
 * @route   GET /me/top-vibes
 * @desc    Returns user's music vibe classification
 */
router.get("/top-vibes", async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	const timeRange = (req.query.time_range as string) || "short_term";

	if (!token) {
		res.status(401).json({ error: "Missing access token" });
		return;
	}

	if (!["short_term", "medium_term", "long_term"].includes(timeRange)) {
		res.status(400).json({
			error: "Invalid time_range. Use 'short_term', 'medium_term', or 'long_term'.",
		});

		return;
	}

	try {
		console.log(`Starting vibe analysis for time range: ${timeRange}`);
		const vibes = await classifyVibes(token, timeRange);
		res.json({
			success: true,
			vibes,
			time_range: timeRange,
		});
	} catch (error: any) {
		console.error("Top vibes endpoint error:", error.message);

		res.status(500).json({
			error: error.message,
			details: error.response?.data || null,
		});
	}
});

export default router;
