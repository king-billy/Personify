"use client";

import SpotifyBarChart from "@/components/SpotifyBarChart";
import TimeRangeTabs, { TimeRangeType } from "@/components/TimeRangeTabs";
import TopTracks from "@/components/TopTracks";
import VibesTreeMap from "@/components/VibesTreeMap";
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
		<div
			className={`${bgClassMap[label]} p-6 shadow-lg rounded-xl h-36 flex flex-col justify-center transition-all hover:scale-[1.02]`}
		>
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

	const topTracks = useSpotifyData<{ tracks: { name: string; artist: string; image: string }[] }>(
		`/me/top-tracks?time_range=${vibeTimeRangeMap[range]}`,
	);

	const isLoading =
		songCount.loading ||
		artistCount.loading ||
		genreCount.loading ||
		minutesPlayed.loading ||
		topArtists.loading ||
		topGenres.loading ||
		topVibes.loading ||
		topTracks.loading;

	const isError =
		songCount.error ||
		artistCount.error ||
		genreCount.error ||
		minutesPlayed.error ||
		topArtists.error ||
		topGenres.error ||
		topVibes.error ||
		topTracks.error;

	if (isLoading) {
		return (
			<div className="p-8 text-xl bg-pink-50/70 rounded-xl shadow-md max-w-6xl mx-auto mt-8">
				<p className="text-center animate-pulse">Loading your musical stats...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-8 text-xl bg-red-50/70 rounded-xl shadow-md max-w-6xl mx-auto mt-8">
				<p className="text-center text-red-500">Error loading your data. Please try again later.</p>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
			<div className="bg-transparent rounded-xl">
				<TimeRangeTabs value={range} onChange={setRange} />
			</div>

			{/* Stats Cards Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<StatCard label="Minutes Listened" value={minutesPlayed.data?.estimated_minutes_played ?? 0} />
				<StatCard label="Tracks Played" value={songCount.data?.count ?? 0} />
				<StatCard label="Artists Explored" value={artistCount.data?.count ?? 0} />
				<StatCard label="Genres Discovered" value={genreCount.data?.count ?? 0} />
			</div>

			{/* Row 1: Top Tracks */}
			<div className="bg-linear-to-br from-pink-400 to-yellow-200 p-6 rounded-xl shadow-lg">
				<div className="flex flex-col md:flex-row gap-8">
					<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl">
						<h2 className="text-2xl font-semibold text-white mb-6">
							Your <span className="text-pink-400">Top Tracks</span>
						</h2>
						<div className="h-[28rem] overflow-y-auto pr-2">
							<TopTracks data={topTracks.data?.tracks || []} isLoading={topTracks.loading} />
						</div>
					</div>
					<div className="md:w-1/2 flex flex-col justify-center p-6">
						<h3 className="text-2xl font-semibold text-gray-800 mb-6">
							What You've Been <span className="text-pink-500">Playing</span>
						</h3>
						<p className="text-gray-700 text-lg leading-relaxed">
							These are the{" "}
							<span className="font-bold text-gray-900">tracks you've listened to most frequently</span>.
							Your top tracks reflect your current musical mood and preferences. Whether it's for{" "}
							<span className="text-blue-600">focus</span>,{" "}
							<span className="text-green-600">relaxation</span>, or pure{" "}
							<span className="text-purple-600">enjoyment</span>, these songs have been on{" "}
							<span className="font-bold">heavy rotation</span>.
						</p>
						<p className="text-gray-700 text-lg mt-4 leading-relaxed">
							The more you listen, the more <span className="italic">accurate</span> your musical profile
							becomes. <span className="underline decoration-yellow-400">Notice any patterns</span> in
							when you listen to certain tracks?
						</p>
					</div>
				</div>
			</div>

			{/* Row 2: Top Artists */}
			<div className="bg-linear-to-br from-yellow-200 to-green-300 p-6 rounded-xl shadow-lg">
				<div className="flex flex-col md:flex-row gap-8">
					<div className="md:w-1/2 flex flex-col justify-center p-6 order-2 md:order-1">
						<h3 className="text-2xl font-semibold text-gray-800 mb-6">
							Your <span className="text-pink-600">Musical Influences</span>
						</h3>
						<p className="text-gray-700 text-lg leading-relaxed">
							These <span className="font-bold">artists have dominated</span> your listening habits. From{" "}
							<span className="text-purple-600">lyrical storytellers</span> to{" "}
							<span className="text-blue-500">sonic innovators</span>, these creators have shaped your{" "}
							<span className="italic">musical journey</span>.
						</p>
						<p className="text-gray-700 text-lg mt-4 leading-relaxed">
							The more you listen, the more your artist preferences{" "}
							<span className="font-bold">evolve</span>.{" "}
							<span className="underline decoration-pink-400">Do you see any favorites emerging</span>?
						</p>
					</div>
					<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl order-1 md:order-2">
						<h2 className="text-2xl font-semibold text-white mb-6">
							Top <span className="text-red-400">Artists</span>
						</h2>
						<div className="h-[28rem]">
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
				</div>
			</div>

			{/* Row 3: Top Genres */}
			<div className="bg-linear-to-br from-green-300 to-teal-300 p-6 rounded-xl shadow-lg">
				<div className="flex flex-col md:flex-row gap-8">
					<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl">
						<h2 className="text-2xl font-semibold text-white mb-6">
							Top <span className="text-teal-300">Genres</span>
						</h2>
						<div className="h-[28rem]">
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
					<div className="md:w-1/2 flex flex-col justify-center p-6">
						<h3 className="text-2xl font-semibold text-gray-800 mb-6">
							Your <span className="text-teal-700">Sonic Palette</span>
						</h3>
						<p className="text-gray-700 text-lg leading-relaxed">
							These <span className="font-bold">genres define</span> your musical taste. Whether you're
							drawn to the <span className="text-red-500">raw energy of rock</span>, the
							<span className="text-purple-600"> intricate rhythms of hip-hop</span>, or the{" "}
							<span className="text-blue-400">emotional depth of classical</span>.
						</p>
						<p className="text-gray-700 text-lg mt-4 leading-relaxed">
							Your genre preferences reveal the{" "}
							<span className="italic">colors of your personal soundscape</span>.{" "}
							<span className="underline decoration-green-400">How diverse is your palette</span>?
						</p>
					</div>
				</div>
			</div>

			{/* Row 4: Top Vibes */}
			<div className="bg-linear-to-br from-teal-300 to-pink-400 p-6 rounded-xl shadow-lg">
				<div className="flex flex-col md:flex-row gap-8">
					<div className="md:w-1/2 flex flex-col justify-center p-6 order-2 md:order-1">
						<h3 className="text-2xl font-semibold text-gray-800 mb-6">
							Your <span className="text-purple-600">Musical Mood</span>
						</h3>
						<p className="text-gray-700 text-lg leading-relaxed">
							These <span className="font-bold">vibes capture</span> the emotional essence of your
							listening habits. From <span className="text-blue-600">energetic</span> to
							<span className="text-purple-600"> melancholic</span>, your vibe distribution shows how you
							use music to <span className="italic">complement or alter</span> your emotional state.
						</p>
						<p className="text-gray-700 text-lg mt-4 leading-relaxed">
							<span className="underline decoration-purple-400">Notice any patterns</span> in when you
							prefer certain vibes? Your musical mood tells a{" "}
							<span className="font-bold">story about you</span>.
						</p>
					</div>
					<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl order-1 md:order-2">
						<h2 className="text-2xl font-semibold text-white mb-6">
							Top <span className="text-indigo-400">Vibes</span>
						</h2>
						<div className="h-[28rem]">
							{topVibes.data ? (
								<VibesTreeMap data={topVibes.data.vibes || {}} />
							) : (
								<p className="text-neutral-400 text-center text-lg mt-10">Loading your vibes...</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VibesDashboard;
