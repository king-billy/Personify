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
		<div className={`${bgClassMap[label]} p-6 shadow-lg rounded-xl h-36 flex flex-col justify-center`}>
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
		return <p className="p-8 text-xl">Loading your musical stats...</p>;
	}

	if (isError) {
		return <p className="p-8 text-xl text-red-400">Error loading your data. Please try again later.</p>;
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<TimeRangeTabs value={range} onChange={setRange} />

			{/* Stats Cards Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-16">
				<StatCard label="Minutes Listened" value={minutesPlayed.data?.estimated_minutes_played ?? 0} />
				<StatCard label="Tracks Played" value={songCount.data?.count ?? 0} />
				<StatCard label="Artists Explored" value={artistCount.data?.count ?? 0} />
				<StatCard label="Genres Discovered" value={genreCount.data?.count ?? 0} />
			</div>

			{/* Row 1: Top Tracks - Chart on left, text on right */}
			<div className="flex flex-col md:flex-row gap-8 mb-20">
				<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl">
					<h2 className="text-2xl font-semibold text-white mb-6">Your Top Tracks</h2>
					<div className="h-[28rem] overflow-y-auto pr-2">
						<TopTracks data={topTracks.data?.tracks || []} isLoading={topTracks.loading} />
					</div>
				</div>
				<div className="md:w-1/2 flex flex-col justify-center p-6">
					<h3 className="text-2xl font-semibold text-white mb-6">What You've Been Playing</h3>
					<p className="text-gray-300 text-lg leading-relaxed">
						These are the tracks you've listened to most frequently. Your top tracks reflect your current
						musical mood and preferences. Whether it's for focus, relaxation, or pure enjoyment, these songs
						have been on heavy rotation.
					</p>
					<p className="text-gray-300 text-lg mt-4 leading-relaxed">
						The more you listen, the more accurate your musical profile becomes. Notice any patterns in when
						you listen to certain tracks?
					</p>
				</div>
			</div>

			{/* Row 2: Top Artists - Text on left, chart on right */}
			<div className="flex flex-col md:flex-row gap-8 mb-20">
				<div className="md:w-1/2 flex flex-col justify-center p-6 order-2 md:order-1">
					<h3 className="text-2xl font-semibold text-white mb-6">Your Musical Influences</h3>
					<p className="text-gray-300 text-lg leading-relaxed">
						These artists have dominated your listening habits. From lyrical storytellers to sonic
						innovators, these creators have shaped your musical journey.
					</p>
					<p className="text-gray-300 text-lg mt-4 leading-relaxed">
						The more you listen, the more your artist preferences evolve. Do you see any favorites emerging?
					</p>
				</div>
				<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl order-1 md:order-2">
					<h2 className="text-2xl font-semibold text-white mb-6">Top Artists</h2>
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

			{/* Row 3: Top Genres - Chart on left, text on right */}
			<div className="flex flex-col md:flex-row gap-8 mb-20">
				<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl">
					<h2 className="text-2xl font-semibold text-white mb-6">Top Genres</h2>
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
					<h3 className="text-2xl font-semibold text-white mb-6">Your Sonic Palette</h3>
					<p className="text-gray-300 text-lg leading-relaxed">
						These genres define your musical taste. Whether you're drawn to the raw energy of rock, the
						intricate rhythms of hip-hop, or the emotional depth of classical.
					</p>
					<p className="text-gray-300 text-lg mt-4 leading-relaxed">
						Your genre preferences reveal the colors of your personal soundscape. How diverse is your
						palette?
					</p>
				</div>
			</div>

			{/* Row 4: Top Vibes - Text on left, chart on right */}
			<div className="flex flex-col md:flex-row gap-8 mb-20">
				<div className="md:w-1/2 flex flex-col justify-center p-6 order-2 md:order-1">
					<h3 className="text-2xl font-semibold text-white mb-6">Your Musical Mood</h3>
					<p className="text-gray-300 text-lg leading-relaxed">
						These vibes capture the emotional essence of your listening habits. From energetic to
						melancholic, your vibe distribution shows how you use music to complement or alter your
						emotional state.
					</p>
					<p className="text-gray-300 text-lg mt-4 leading-relaxed">
						Notice any patterns in when you prefer certain vibes? Your musical mood tells a story about you.
					</p>
				</div>
				<div className="md:w-1/2 bg-gray-900 p-6 rounded-xl order-1 md:order-2">
					<h2 className="text-2xl font-semibold text-white mb-6">Top Vibes</h2>
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
	);
};

export default VibesDashboard;
