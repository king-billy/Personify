import { MIDDLEWARE_PORT, SITE_ACCESS, SPOTIFY_ACCESS } from "@/lib/constants";

export interface SPOTIFY_DATA_INTERFACE {
	bearer: string;
	expiration: string;
}

/**
 * Call from middleware endpoint with Spotify
 * @param endpoint
 * @returns JSON data from fetch call
 */
export const fetchSpotifyAccess = async (endpoint: string) => {
	const accessData = localStorage.getItem(SPOTIFY_ACCESS);
	if (!accessData) throw new Error("No access token found for Spotify");

	try {
		const parsedAccessData: SPOTIFY_DATA_INTERFACE = JSON.parse(accessData);

		const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}${endpoint}`, {
			headers: {
				Authorization: `Bearer ${parsedAccessData.bearer}`,
			},
		});

		const text = await res.text(); // Try to parse manually for better error handling

		if (!res.ok) {
			throw new Error(`Spotify API error ${res.status}: ${text}`);
		}

		return JSON.parse(text);
	} catch (err: any) {
		throw new Error(`Spotify fetch failed: ${err.message}`);
	}
};

/**
 * Call from middleware endpoint with Supabase
 * @param endpoint
 * @returns JSON data from fetch call
 */
export const fetchAccountAccess = async <T>(endpoint: string): Promise<T> => {
	const token = localStorage.getItem(SITE_ACCESS);
	if (!token) throw new Error("No auth token found");

	try {
		const res = await fetch(`http://localhost:6969${endpoint}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const text = await res.text();

		if (!res.ok) {
			throw new Error(`Supabase API error ${res.status}: ${text}`);
		}

		return JSON.parse(text);
	} catch (err: any) {
		throw new Error(`Supabase fetch failed: ${err.message}`);
	}
};
