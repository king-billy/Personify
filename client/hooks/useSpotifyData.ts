import { fetchSpotifyAccess } from "@/lib/api";
import { useEffect, useState } from "react";

export const useSpotifyData = <T>(endpoint: string) => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchSpotifyAccess(endpoint)
			.then((res) => {
				setData(res);
			})
			.catch((err) => {
				setError(err.message || "Error loading data");
			})
			.finally(() => {
				setLoading(false);
			});
	}, [endpoint]);

	return {
		data,
		loading,
		error,
	};
};
