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
	Chill: "rgba(42, 120, 142, 0.7)",
	Energetic: "rgba(240, 249, 33, 0.7)",
	Melancholy: "rgba(65, 68, 135, 0.7)",
	Romantic: "rgba(140, 41, 129, 0.7)",
	Confident: "rgba(225, 100, 98, 0.7)",
	Nostalgic: "rgba(126, 3, 168, 0.7)",
	Artsy: "rgba(248, 149, 64, 0.7)",
	Dark: "rgba(13, 8, 135, 0.7)",
	Rage: "rgba(252, 206, 37, 0.7)",
	Futuristic: "rgba(59, 4, 154, 0.7)",
	Party: "rgba(237, 121, 83, 0.7)",
	Ambient: "rgba(92, 1, 166, 0.7)",
	Spiritual: "rgba(106, 0, 168, 0.7)",
	Dreamy: "rgba(183, 55, 121, 0.7)",
	Rebellious: "rgba(219, 91, 104, 0.7)",
	Carefree: "rgba(244, 136, 73, 0.7)",
	Classy: "rgba(156, 23, 158, 0.7)",
	Cinematic: "rgba(45, 17, 154, 0.7)",
	Theatrical: "rgba(204, 71, 120, 0.7)",
	Alternative: "rgba(240, 249, 33, 0.7)",
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
	const getTextColor = (bgColor: string): string => {
		if (!bgColor) return "#000000";

		// Handle rgba format
		const rgbaMatch = bgColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/i);
		if (rgbaMatch) {
			const r = parseInt(rgbaMatch[1]);
			const g = parseInt(rgbaMatch[2]);
			const b = parseInt(rgbaMatch[3]);
			const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
			return luminance > 0.5 ? "#000000" : "#ffffff";
		}

		return "#000000"; // Default fallback
	};

	// Prepare data for Nivo Treemap format
	const transformDataForNivo = () => {
		if (!data || Object.keys(data).length === 0) {
			return [];
		}

		return Object.entries(data)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 15)
			.map(([vibe, value]) => ({
				name: vibe,
				value: value,
				color: moodColors[vibe] || "rgba(153, 153, 153, 0.7)",
				description: moodDescriptions[vibe] || "No description available.",
			}));
	};

	const nodesData = transformDataForNivo();
	const totalValue = nodesData.reduce((sum, item) => sum + item.value, 0);

	// Empty state handling
	if (!nodesData || nodesData.length === 0) {
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
		const percentage = ((node.value / totalValue) * 100).toFixed(1);
		return (
			<div className="bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl border border-white/20 font-inter max-w-[220px]">
				<div className="flex items-center gap-2 mb-2">
					<div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: node.data.color }} />
					<h3 className="text-base font-bold" style={{ color: node.data.color }}>
						{node.data.name}
					</h3>
				</div>
				<div className="text-sm mb-1">
					<span className="text-white/70">Share: </span>
					<span className="font-semibold">{percentage}%</span>
				</div>
				<p className="text-xs text-white/60 mt-2 leading-tight">{node.data.description}</p>
			</div>
		);
	};

	return (
		<div className="h-full flex flex-col font-inter">
			{title && <h3 className="text-white text-center mb-4 text-xl font-semibold">{title}</h3>}
			<div className="flex-grow relative w-full h-full min-h-[300px] lg:min-h-[400px]">
				<ResponsiveTreeMap
					data={{
						// Create a dummy root with our actual nodes as children
						name: "root",
						children: nodesData,
					}}
					identity="name"
					value="value"
					valueFormat=".0s"
					margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
					label={(node) => `${node.id}`}
					labelSkipSize={12}
					// @ts-ignore
					labelTextColor={(node) => getTextColor(node.data.color)}
					parentLabelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
					// @ts-ignore
					colors={(node) => node.data.color}
					borderWidth={1}
					borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
					// @ts-ignore
					tooltip={CustomTooltip}
					nodeOpacity={1}
					tile="squarify"
					innerPadding={3}
					outerPadding={3}
					animate={true}
					motionConfig="gentle"
					theme={{
						labels: {
							text: {
								fontSize: 14,
								fontWeight: 600,
							},
						},
					}}
					// These prevent the root node from being rendered
					enableParentLabel={false}
					leavesOnly={true}
				/>
			</div>
		</div>
	);
};

export default VibesTreeMap;
