import { Request, Response, Router } from "express";
import { SPOTIFY_SCOPES } from "../constants";

const spotifyAuthRouter = Router();

/**
 * @route   GET /spotify-auth/login
 * @desc    Redirects the user to Spotify's authorization page to start OAuth flow
 */
spotifyAuthRouter.get("/login", (req: Request, res: Response) => {
	const scope = SPOTIFY_SCOPES.join(" ");
	const clientID: string = process.env.SPOTIFY_CLIENT_ID;

	if (!clientID) {
		res.status(500).send("Missing SPOTIFY_CLIENT_ID. Check your configuration!");
		return;
	}

	const params: URLSearchParams = new URLSearchParams({
		response_type: "code",
		client_id: clientID,
		scope: scope,
		redirect_uri: `http://localhost:${process.env.MIDDLEWARE_PORT}/spotify-auth/callback`,
	});

	// Redirect user to Spotify's authorization URL
	res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

/**
 * @route   GET /spotify-auth/callback
 * @desc    Handles Spotify redirect after user authorizes the app.
 * 			Exchanges authorization code for access and refresh tokens
 */
spotifyAuthRouter.get("/callback", async (req: Request, res: Response) => {
	const code = req.query.code as string;

	if (!code) {
		res.status(400).send("Missing authorization code.");
		return;
	}

	try {
		const body = new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: process.env.SPOTIFY_REDIRECT_URI ?? `http://localhost:${process.env.MIDDLEWARE_PORT}/spotify-auth/callback`,
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
		if (!data) {
			res.send("Error: Investigate issue.");
			return;
		}

		const { access_token, expires_in } = data;

		// Redirect to frontend
		const url_to_redirect = `http://localhost:3000/spotify-auth/callback?access_token=${access_token}&expires_in=${expires_in}`;
		res.redirect(url_to_redirect);
	} catch (err: any) {
		console.error("Callback error:", err.message);
		res.status(500).send("Failed to authenticate with Spotify.");
	}
});

/**
 * @route   POST /spotify-auth/refresh
 * @desc    Refreshes access token using a valid refresh token
 */
spotifyAuthRouter.post("/refresh", async (req: Request, res: Response) => {
	const { refresh_token } = req.body;

	if (!refresh_token) {
		res.status(400).send("Missing authorization refresh_token.");
		return;
	}

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
		res.status(200).json(data);
	} catch (error) {
		res.status(500).json({ error: "Failed to refresh token" });
	}
});

export default spotifyAuthRouter;
