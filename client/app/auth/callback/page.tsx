"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
	const router = useRouter();

	useEffect(() => {
		const url = new URL(window.location.href);
		const accessToken = url.searchParams.get("access_token");
		const localStorageKey = "spotify_access_token";

		if (accessToken) {
			localStorage.setItem(localStorageKey, accessToken);
			router.replace("/success");
		} else {
			console.error("No access token found");
		}
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<h2 className="text-xl">Processing authentication...</h2>
		</div>
	);
}
