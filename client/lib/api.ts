import { MIDDLEWARE_PORT, SPOTIFY_ACCESS } from "@/lib/constants";

const fetchWithToken = async (endpoint: string) => {
	const token = localStorage.getItem(SPOTIFY_ACCESS);

	if (!token) throw new Error("No access token found");

	const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		throw new Error(`API error: ${res.status}`);
	}

	return res.json();
};

export default fetchWithToken;
