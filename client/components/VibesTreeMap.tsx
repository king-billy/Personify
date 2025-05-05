"use client";
import { ResponsiveTreeMap } from "@nivo/treemap";
import React from "react";

interface TreeMapProps {
	data: Record<string, number>;
	title?: string;
}

interface TreeItemData {
	name: string;
	value: number;
	color: string;
	description: string;
}

interface TreeMapRoot {
	name: string;
	children: TreeItemData[];
}

interface TreeMapNode {
	id: string | number;
	value: number;
	data: TreeItemData;
}

const moodColors: Record<string, string> = {
	Chill: "#A7C7E7",
	Energetic: "#FFA500",
	Melancholy: "#1E3A8A",
	Romantic: "#FF66B2",
	Confident: "#DC143C",
	Nostalgic: "#704214",
	Artsy: "#FFDB58",
	Dark: "#36454F",
	Rage: "#BB0A1E",
	Futuristic: "#00FFFF",
	Party: "#BF00FF",
	Ambient: "#D3D3D3",
	Spiritual: "#8A2BE2",
	Dreamy: "#E6E6FA",
	Rebellious: "#343434",
	Carefree: "#87CEEB",
	Classy: "#800020",
	Cinematic: "#191970",
	Theatrical: "#7851A9",
	Alternative: "#228B22",
};

const moodDescriptions: Record<string, string> = {
	Chill: "Relaxed, mellow, and laid-back tunes",
	Energetic: "High-tempo, upbeat, and lively tracks",
	Melancholy: "Thoughtful, sad, or introspective songs",
	Romantic: "Love songs and passionate melodies",
	Confident: "Bold, self-assured, and powerful music",
	Nostalgic: "Music that evokes memories of the past",
	Artsy: "Experimental or avant-garde compositions",
	Dark: "Moody, intense, or brooding sounds",
	Rage: "Aggressive, angry, or high-energy tracks",
	Futuristic: "Electronic or innovative sonic landscapes",
	Party: "Danceable and celebratory anthems",
	Ambient: "Atmospheric and background-style music",
	Spiritual: "Soulful or religious-inspired music",
	Dreamy: "Ethereal, hazy, or surreal soundscapes",
	Rebellious: "Defiant, anti-establishment, or punk vibes",
	Carefree: "Lighthearted and joyful melodies",
	Classy: "Sophisticated and elegant compositions",
	Cinematic: "Music that feels like a film soundtrack",
	Theatrical: "Dramatic and performance-oriented pieces",
	Alternative: "Non-mainstream or indie-style music",
};

const VibesTreeMap: React.FC<TreeMapProps> = ({ data, title }) => {
	// Prepare data for Nivo Treemap format
	const transformDataForNivo = (): TreeMapRoot => {
		if (!data || Object.keys(data).length === 0) {
			// Nivo needs a root node structure even if empty
			return { name: "Vibes", children: [] };
		}

		const processedData = Object.entries(data)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 15) // Show top 15 vibes
			.map(([vibe, value]) => ({
				name: vibe,
				value: value,
				color: moodColors[vibe] || "#999999",
				description: moodDescriptions[vibe] || "No description available.",
			}));

		return {
			name: "Vibes", // Root node for the treemap
			children: processedData,
		};
	};

	const nivoData = transformDataForNivo();

	// Calculate total value for percentage calculation in tooltip
	const totalValue = nivoData.children.reduce((sum, item) => sum + item.value, 0);

	// Empty state handling
	if (!nivoData.children || nivoData.children.length === 0) {
		return (
			<div className="h-full flex flex-col font-inter">
				{title && <h3 className="text-white text-center mb-4 text-xl font-semibold">{title}</h3>}
				<div className="flex-grow relative min-h-[300px] flex items-center justify-center border border-dashed border-gray-600 rounded-md bg-gray-800">
					<p className="text-neutral-400">No vibe data available</p>
				</div>
			</div>
		);
	}

	// Tooltip
	const CustomTooltip = ({ node }: { node: TreeMapNode }) => {
		// Calculate percentage
		const percentage = ((node.value / totalValue) * 100).toFixed(1);

		return (
			<div
				style={{
					backgroundColor: "rgba(0, 0, 0, 0.8)",
					color: "#fff",
					padding: "10px 15px",
					borderRadius: "3px",
					boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
				}}
				className="font-inter text-sm"
			>
				<strong style={{ color: node.data.color }}>{node.data.name}</strong>
				<br />
				Value: {node.value.toLocaleString()}
				<br />
				Percentage: {percentage}%
				<br />
				<span className="text-xs text-neutral-300">{node.data.description}</span>
			</div>
		);
	};

	return (
		<div className="h-full flex flex-col font-inter">
			{title && <h3 className="text-white text-center mb-4 text-xl font-semibold">{title}</h3>}
			<div className="flex-grow relative w-full h-full min-h-[300px] lg:min-h-[400px]">
				<ResponsiveTreeMap
					data={nivoData}
					identity="name"
					value="value"
					valueFormat=".0s"
					margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
					label={(node) => `${node.id}`}
					labelSkipSize={18}
					labelTextColor={{ from: "color", modifiers: [["darker", 2.5]] }}
					parentLabelPosition="left"
					parentLabelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
					parentLabelPadding={5}
					colors={(node) => node.data.color}
					borderWidth={1}
					borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
					tooltip={CustomTooltip}
					nodeOpacity={0.85}
					tile="squarify"
					innerPadding={3}
					outerPadding={3}
					animate={true}
					motionConfig="gentle"
				/>
			</div>
		</div>
	);
};

export default VibesTreeMap;
