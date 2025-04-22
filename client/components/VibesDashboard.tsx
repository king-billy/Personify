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
		"Minutes Listened": "bg-pink-100",
		"Tracks Played": "bg-yellow-100",
		"Artists Explored": "bg-cyan-100",
		"Genres Discovered": "bg-green-100",
	};

	return (
		<div className={`${bgClassMap[label]} p-8 shadow-lg cursor-pointer`}>
			<p className="text-5xl font-extrabold text-black">{value}</p>
			<p className="mt-3 text-xl text-black font-medium">{label}</p>
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
		return <p className="p-8 text-xl font-inter">Loading your musical stats...</p>;
	}

	if (isError) {
		return <p className="p-8 text-xl text-red-400 font-inter">Error loading your data. Please try again later.</p>;
	}

	return (
		<div className="space-y-10 font-inter px-4 py-6">
			<TimeRangeTabs value={range} onChange={setRange} />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
				<StatCard label="Minutes Listened" value={minutesPlayed.data?.estimated_minutes_played ?? 0} />
				<StatCard label="Tracks Played" value={songCount.data?.count ?? 0} />
				<StatCard label="Artists Explored" value={artistCount.data?.count ?? 0} />
				<StatCard label="Genres Discovered" value={genreCount.data?.count ?? 0} />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-stretch">
				<div className="col-span-2 flex flex-col space-y-8 h-full">
					<div className="bg-gray-900 p-6 h-80 flex flex-col items-center">
						<h2 className="text-3xl font-semibold text-white mb-4 text-center">
							Vibes Throughout The Year
						</h2>
						<p className="text-white text-xl">[Graph]</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
						<div className="bg-gray-900 p-6 min-h-[280px] h-full">
							<h2 className="text-3xl font-semibold text-white mb-4 text-center">Top Artists</h2>
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
						<div className="bg-gray-900 p-6 min-h-[280px] h-full">
							<h2 className="text-3xl font-semibold text-white mb-4 text-center">Top Genres</h2>
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
				<div className="bg-gray-900 p-6 flex flex-col items-center min-h-[600px] h-full">
					<h2 className="text-3xl font-semibold text-white mb-4 text-center">Your Top Vibes</h2>
					{topVibes.data ? (
						<div className="w-full h-full">
							<VibesBarChart data={topVibes.data.vibes || {}} />
						</div>
					) : (
						<p className="text-neutral-400 text-center text-lg mt-10">Loading your vibes...</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default VibesDashboard;
