import { MIDDLEWARE_PORT, SPOTIFY_ACCESS } from "@/lib/constants";

export interface SPOTIFY_DATA_INTERFACE {
	bearer: string;
	expiration: string;
}

export const fetchAccess = async (endpoint: string) => {
	const accessData = localStorage.getItem(SPOTIFY_ACCESS);
	if (!accessData) {
		throw new Error("No access token found");
	}

	const parsedAccessData: SPOTIFY_DATA_INTERFACE = JSON.parse(accessData);

	const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${parsedAccessData.bearer}`,
		},
	});

	if (!res.ok) {
		throw new Error(`API error: ${res.status}`);
	}

	return res.json();
};

export const matchExpiration = () => {};
