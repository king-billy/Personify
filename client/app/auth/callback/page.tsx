"use client";

import { SPOTIFY_DATA_INTERFACE } from "@/lib/api";
import { SPOTIFY_ACCESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CallbackPage = () => {
	const router = useRouter();

	useEffect(() => {
		const url = new URL(window.location.href);
		const accessToken = url.searchParams.get("access_token");
		const expiration = url.searchParams.get("expires_in");

		if (accessToken && expiration) {
			const spotifyExpiration = parseInt(expiration);
			const now = new Date();
			const expirationTimestamp = new Date(now.getTime() + spotifyExpiration * 1000); // 1000 = second to milliseconds

			const data: SPOTIFY_DATA_INTERFACE = {
				bearer: accessToken,
				expiration: expirationTimestamp.toISOString(),
			} as const;

			localStorage.setItem(SPOTIFY_ACCESS, JSON.stringify(data));

			// router.replace("/success");
			router.replace("/dashboard");
		} else {
			console.error("Error fetching spotify data.");
		}
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<h2 className="text-xl">Processing authentication...</h2>
		</div>
	);
};

export default CallbackPage;
