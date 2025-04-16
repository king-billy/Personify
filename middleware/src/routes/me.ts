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

    if (!response.ok)
      throw new Error(data.error?.message || "Failed to fetch profile");

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
      const followed = await fetch(
        "https://api.spotify.com/v1/me/following?type=artist&limit=50",
        { headers }
      );
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
        ...(recentData.items?.map((item: any) => item.track.artists).flat() ||
          []),
        ...(savedData.items?.map((item: any) => item.track.artists).flat() ||
          []),
      ];

      const combinedArtists = [
        ...(followedData.artists?.items || []),
        ...artistsFromTracks,
      ];

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
    const response = await fetch(
      `https://api.spotify.com/v1/me/following?type=artist&limit=${limit}`,
      {
        headers: createAuthHeader(token),
      }
    );

    const data = await response.json();

    if (!response.ok)
      throw new Error(
        data.error?.message || "Failed to fetch followed artists"
      );

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
    const response = await fetch(
      `https://api.spotify.com/v1/me/playlists?limit=${limit}`,
      {
        headers: createAuthHeader(token),
      }
    );
    const data = await response.json();

    if (!response.ok)
      throw new Error(
        data.error?.message || "Failed to fetch followed playlists"
      );

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
    const recent = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      { headers }
    );
    const recentData = await recent.json();

    const filteredTracks = (recentData.items || []).filter(
      (item: any) => new Date(item.played_at).getTime() >= cutoff
    );

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

    const followedData = await followed.json();
    const recentData = await recent.json();

    const artistsFromTracks = (recentData.items || [])
      .filter((item: any) => new Date(item.played_at).getTime() >= cutoff)
      .map((item: any) => item.track.artists)
      .flat();

    const combinedArtists = [
      ...(followedData.artists?.items || []),
      ...artistsFromTracks,
    ];

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
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${time_range}`,
      { headers }
    );
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
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${time_range}`,
      { headers }
    );
    const data = await response.json();

    const totalDurationMs = (data.items || []).reduce(
      (sum: number, track: any) => sum + track.duration_ms,
      0
    );

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
    const filteredRecent = (recentData.items || []).filter(
      (item: any) => new Date(item.played_at).getTime() >= cutoff
    );

    const allArtists = [...filteredRecent, ...(savedData.items || [])]
      .map((item: any) => item.track?.artists || [])
      .flat();

    // Count frequency
    const artistMap: Record<
      string,
      { name: string; count: number; image: string }
    > = {};

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
      const fullArtistData = await fetch(
        `https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`,
        { headers }
      );
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

    const response = await fetch(
      `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${time_range}`,
      { headers }
    );
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
 */
router.get("/top-vibes", async (req: Request, res: Response) => {});

export default router;
