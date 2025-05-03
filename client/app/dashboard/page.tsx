"use client";

import HeaderComponent from "@/components/HeaderComponent";
import LandingPage from "@/components/LandingPage";
import VibesDashboard from "@/components/VibesDashboard";
import { useAccountData } from "@/hooks/useAccountData";
import { SPOTIFY_ACCESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DashboardPage = () => {
	const router = useRouter();
	const [accountAuthChecked, setAccountAuthChecked] = useState<boolean>(false);
	const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean>(false);

	const { data: userData, loading: userLoading, error: userError } = useAccountData<{ user: any }>("/auth/me");

	// checking authentication with user account
	useEffect(() => {
		if (userError) {
			router.replace("/");
		}

		setAccountAuthChecked(true);
	}, [userData, userError, router]);

	// checking Spotify access
	useEffect(() => {
		const raw = localStorage.getItem(SPOTIFY_ACCESS);
		if (!raw) {
			setIsSpotifyConnected(false);
			return;
		}

		const parsed = JSON.parse(raw);
		const expirationDate = new Date(parsed.expiration);
		const now = new Date();

		// Only valid if expiration time is still in the future
		setIsSpotifyConnected(expirationDate > now);
	}, [router]);

	if (!accountAuthChecked) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Checking authentication...</p>
			</div>
		);
	}

	return (
		<>
			<HeaderComponent />
			<div className={`w-screen min-h-screen ${isSpotifyConnected && "pb-60"}`}>
				<LandingPage isSpotifyConnected={isSpotifyConnected} />
			</div>
			{isSpotifyConnected && (
				<div id="dashboard" className="min-h-screen p-6">
					<div className="max-w-7xl mx-auto">
						<h1 className="text-6xl font-bold mb-6">Your Stats.</h1>
						<VibesDashboard />
					</div>
				</div>
			)}
		</>
	);
};

export default DashboardPage;
