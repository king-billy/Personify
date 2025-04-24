"use client";

import SpotifyBarChart from "@/components/SpotifyBarChart";
import TimeRangeTabs, { TimeRangeType } from "@/components/TimeRangeTabs";
import VibesBarChart from "@/components/VibesBarChart";
import { useSpotifyData } from "@/hooks/useSpotifyData";
import { JSX, useState } from "react";

type StatCardLabelType = "Minutes Listened" | "Tracks Played" | "Artists Explored" | "Genres Discovered";

interface StatCardInterface {
	label: StatCardLabelType;
	value: number;
}

const StatCard = ({ label, value }: StatCardInterface): JSX.Element => {
	const bgClassMap: Record<StatCardLabelType, string> = {
		"Minutes Listened": "bg-pink-200",
		"Tracks Played": "bg-yellow-200",
		"Artists Explored": "bg-green-200",
		"Genres Discovered": "bg-teal-300",
	};

	return (
		<div className={`${bgClassMap[label]} p-6 shadow-lg rounded-xl`}>
			<p className="text-4xl font-mono font-bold text-black">{value}</p>
			<p className="mt-2 text-lg text-black font-medium">{label}</p>
		</div>
	);
};

const VibesDashboard = (): JSX.Element => {
	const [range, setRange] = useState<TimeRangeType>("daily");

	const songCount = useSpotifyData<{ count: number }>(`/me/song-count?range=${range}`);
	const artistCount = useSpotifyData<{ count: number }>(`/me/artist-count?range=${range}`);
	const genreCount = useSpotifyData<{ count: number }>(`/me/genre-count?range=${range}`);
	const minutesPlayed = useSpotifyData<{ estimated_minutes_played: number }>(`/me/minutes-played?range=${range}`);

	const topArtists = useSpotifyData<{ top: { name: string; count: number }[] }>(`/me/top-artists?range=${range}`);
	const topGenres = useSpotifyData<{ top: { genre: string; count: number }[] }>(`/me/top-genres?range=${range}`);

	const vibeTimeRangeMap: Record<TimeRangeType, string> = {
		daily: "short_term",
		week: "short_term",
		month: "medium_term",
		year: "long_term",
	};

	const topVibes = useSpotifyData<{ vibes: Record<string, number> }>(
		`/me/top-vibes?time_range=${vibeTimeRangeMap[range]}`,
	);

	const isLoading = songCount.loading || artistCount.loading || genreCount.loading || minutesPlayed.loading;

	const isError =
		songCount.error ||
		artistCount.error ||
		genreCount.error ||
		minutesPlayed.error ||
		topArtists.error ||
		topGenres.error;

	if (isLoading) {
		return <p className="p-8 text-xl">Loading your musical stats...</p>;
	}

	if (isError) {
		return <p className="p-8 text-xl text-red-400">Error loading your data. Please try again later.</p>;
	}

	return (
		<div className="max-w-full mx-auto">
			<TimeRangeTabs value={range} onChange={setRange} />

			{/* Stats Cards Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
				<StatCard label="Minutes Listened" value={minutesPlayed.data?.estimated_minutes_played ?? 0} />
				<StatCard label="Tracks Played" value={songCount.data?.count ?? 0} />
				<StatCard label="Artists Explored" value={artistCount.data?.count ?? 0} />
				<StatCard label="Genres Discovered" value={genreCount.data?.count ?? 0} />
			</div>

			<div className="mt-20"></div>

			{/* Main 2x2 Chart Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Top Left: Vibes Throughout The Year */}
				<div className="bg-gray-900 p-6">
					<h2 className="text-2xl font-semibold text-white mb-4">Vibes Throughout The Year</h2>
					<div className="h-96">
						<p className="text-white text-xl">[Graph]</p>
					</div>
				</div>

				{/* Top Right: Top Artists */}
				<div className="bg-gray-900 p-6 rounded-xl">
					<h2 className="text-2xl font-semibold text-white mb-4 text-center">Top Artists</h2>
					<div className="h-96">
						{topArtists.data ? (
							<SpotifyBarChart
								data={topArtists.data.top}
								labelKey="name"
								bgColor="rgba(255, 99, 132, 0.6)"
							/>
						) : (
							<p className="text-neutral-400 text-center text-lg mt-10">Loading...</p>
						)}
					</div>
				</div>

				{/* Bottom Left: Your Top Vibes */}
				<div className="bg-gray-900 p-6 rounded-xl">
					<h2 className="text-2xl font-semibold text-white mb-4 text-center">Your Top Vibes</h2>
					<div className="h-96">
						{topVibes.data ? (
							<VibesBarChart data={topVibes.data.vibes || {}} />
						) : (
							<p className="text-neutral-400 text-center text-lg mt-10">Loading your vibes...</p>
						)}
					</div>
				</div>

				{/* Bottom Right: Top Genres */}
				<div className="bg-gray-900 p-6 rounded-xl">
					<h2 className="text-2xl font-semibold text-white mb-4 text-center">Top Genres</h2>
					<div className="h-96">
						{topGenres.data ? (
							<SpotifyBarChart
								data={topGenres.data.top}
								labelKey="genre"
								bgColor="rgba(75, 192, 192, 0.6)"
							/>
						) : (
							<p className="text-neutral-400 text-center text-lg mt-10">Loading...</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default VibesDashboard;
