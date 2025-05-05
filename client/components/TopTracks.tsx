"use client";

import Image from "next/image";

interface TopTrack {
	name: string;
	artist: string;
	image: string;
}

interface TopTracksProps {
	data: TopTrack[];
	isLoading: boolean;
}

const TopTracks = ({ data, isLoading }: TopTracksProps) => {
	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-neutral-400">Loading top tracks...</p>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="h-full flex items-center justify-center">
				<p className="text-neutral-400">No tracks data available</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{data.map((track, index) => (
				<div key={index} className="flex items-center gap-4 p-2 hover:bg-gray-800 rounded-lg transition-colors">
					<div className="relative w-12 h-12 flex-shrink-0">
						{track.image ? (
							<Image
								src={track.image}
								alt={`${track.name} cover`}
								fill
								className="rounded-md object-cover"
								unoptimized
							/>
						) : (
							<div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
								<span className="text-xs text-gray-400">No Image</span>
							</div>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-white font-medium truncate">{track.name}</p>
						<p className="text-gray-400 text-sm truncate">{track.artist}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default TopTracks;
