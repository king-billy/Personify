import { Request, Response, Router } from "express";
import { SPOTIFY_SCOPES } from "../constants";

const router = Router();

/**
 * @route   GET /auth/login
 * @desc    Redirects the user to Spotify's authorization page to start OAuth flow
 */
router.get("/login", (req: Request, res: Response) => {
	const scope = SPOTIFY_SCOPES.join(" ");

	const params: URLSearchParams = new URLSearchParams({
		response_type: "code",
		client_id: process.env.SPOTIFY_CLIENT_ID || "",
		scope: scope,
		redirect_uri: `http://localhost:${process.env.MIDDLEWARE_PORT}/auth/callback`,
	});

	// Redirect user to Spotify's authorization URL
	res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

/**
 * @route   GET /auth/callback
 * @desc    Handles Spotify redirect after user authorizes the app.
 * 			Exchanges authorization code for access and refresh tokens
 */
router.get("/callback", async (req: Request, res: Response) => {
	const code = req.query.code as string;

	try {
		const body = new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: process.env.REDIRECT_URI ?? `http://localhost:${process.env.MIDDLEWARE_PORT}/auth/callback`,
		});

		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Basic " + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64"),
			},
			body,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Spotify token error: ${errorText}`);
		}

		const data = await response.json();
		if (!data || !data.access_token) {
			res.send("Error: Investigate issue.");
			return;
		}

		// Redirect to frontend
		res.redirect(`http://localhost:3000/auth/callback?access_token=${data.access_token}`);
	} catch (err: any) {
		console.error("Callback error:", err.message);
		res.status(500).send("Failed to authenticate with Spotify.");
	}
});

/**
 * @route   POST /auth/refresh
 * @desc    Refreshes access token using a valid refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
	const { refresh_token } = req.body;

	const params = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token,
	});

	try {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Basic " + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64"),
			},
			body: params,
		});

		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: "Failed to refresh token" });
	}
});

export default router;
