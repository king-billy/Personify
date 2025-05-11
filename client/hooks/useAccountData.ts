import { fetchAccountAccess } from "@/lib/api";
import { useEffect, useState } from "react";

export const useAccountData = <T>(endpoint: string) => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const result = await fetchAccountAccess<T>(endpoint);
				setData(result);
			} catch (err: any) {
				setError(err.message || "Error loading Supabase data");
			} finally {
				setLoading(false);
			}
		})();
	}, [endpoint]);

	return {
		data,
		loading,
		error,
	};
};
