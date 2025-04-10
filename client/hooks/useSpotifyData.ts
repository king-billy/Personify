import fetchWithToken from "@/lib/api";
import { useEffect, useState } from "react";

export function useSpotifyData<T>(endpoint: string) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const result = await fetchWithToken(endpoint);
				setData(result);
			} catch (err: any) {
				setError(err.message || "Error loading data");
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [endpoint]);

	return { data, loading, error };
}
