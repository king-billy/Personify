"use client";

import SpotifyBarChart from "@/components/SpotifyBarChart";
import TimeRangeTabs, { TimeRangeType } from "@/components/TimeRangeTabs";
import VibesBarChart from "@/components/VibesBarChart";
import { useSpotifyData } from "@/hooks/useSpotifyData";
import { JSX, useState } from "react";

type StatCardLabelType = "Minutes" | "Songs" | "Artists" | "Genres";

interface StatCardInterface {
	label: StatCardLabelType;
	value: number;
}

const StatCard = ({ label, value }: StatCardInterface): JSX.Element => {
	const bgClassMap: Record<StatCardLabelType, string> = {
		Minutes: "bg-pink-100",
		Songs: "bg-yellow-100",
		Artists: "bg-cyan-100",
		Genres: "bg-green-100",
	};

	return (
		<div className={`${bgClassMap[label]} rounded-lg p-6 shadow-md cursor-pointer`}>
			<p className="text-4xl font-extrabold text-black">{value}</p>
			<p className="mt-2 text-lg text-black">
				{label} {label === "Minutes" ? "Played" : "Listened"}
			</p>
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
		return <p className="p-6 text-lg">Loading your musical stats...</p>;
	}

	if (isError) {
		return <p className="p-6 text-lg text-red-400">Error loading your data. Please try again later.</p>;
	}

	return (
		<div className="space-y-6">
			<TimeRangeTabs value={range} onChange={setRange} />

			<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
				<StatCard label="Minutes" value={minutesPlayed.data?.estimated_minutes_played ?? 0} />
				<StatCard label="Songs" value={songCount.data?.count ?? 0} />
				<StatCard label="Artists" value={artistCount.data?.count ?? 0} />
				<StatCard label="Genres" value={genreCount.data?.count ?? 0} />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 items-stretch">
				<div className="col-span-2 flex flex-col space-y-6 h-full">
					<div className="bg-neutral-800 rounded-lg p-4 h-64 flex flex-col items-center">
						<h2 className="text-2xl font-semibold text-white mb-2 text-center">
							Vibes Throughout The Year
						</h2>
						<p className="text-white text-lg">[Graph]</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
						<div className="bg-neutral-800 rounded-lg p-4 min-h-[200px] h-full">
							<h2 className="text-2xl font-semibold text-white mb-2 text-center">Top Artists</h2>
							{topArtists.data ? (
								<SpotifyBarChart
									data={topArtists.data.top}
									labelKey="name"
									bgColor="rgba(255, 99, 132, 0.6)"
								/>
							) : (
								<p className="text-neutral-400 text-center text-sm">Loading...</p>
							)}
						</div>
						<div className="bg-neutral-800 rounded-lg p-4 min-h-[200px] h-full">
							<h2 className="text-2xl font-semibold text-white mb-2 text-center">Top Genres</h2>
							{topGenres.data ? (
								<SpotifyBarChart
									data={topGenres.data.top}
									labelKey="genre"
									bgColor="rgba(75, 192, 192, 0.6)"
								/>
							) : (
								<p className="text-neutral-400 text-center text-sm">Loading...</p>
							)}
						</div>
					</div>
				</div>
				<div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center min-h-[500px] h-full">
					<h2 className="text-2xl font-semibold text-white mb-2 text-center">Your Top Vibes</h2>
					{topVibes.data ? (
						<div className="w-full h-full">
							<VibesBarChart data={topVibes.data.vibes || {}} />
						</div>
					) : (
						<p className="text-neutral-400 text-center text-sm mt-10">Loading your vibes...</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default VibesDashboard;
