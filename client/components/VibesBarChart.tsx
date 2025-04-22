"use client";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartProps {
	data: Record<string, number>;
	title?: string;
}

const moodColors: Record<string, string> = {
	Chill: "#A7C7E7", // Soft blue
	Energetic: "#FFA500", // Bright orange
	Melancholy: "#1E3A8A", // Deep blue
	Romantic: "#FF66B2", // Rose pink
	Confident: "#DC143C", // Crimson red
	Nostalgic: "#704214", // Sepia
	Artsy: "#FFDB58", // Mustard yellow
	Dark: "#36454F", // Charcoal black
	Rage: "#BB0A1E", // Blood red
	Futuristic: "#00FFFF", // Neon cyan
	Party: "#BF00FF", // Electric purple
	Ambient: "#D3D3D3", // Cool gray
	Spiritual: "#8A2BE2", // Violet
	Dreamy: "#E6E6FA", // Lavender
	Rebellious: "#343434", // Jet black
	Carefree: "#87CEEB", // Sky blue
	Classy: "#800020", // Burgundy
	Cinematic: "#191970", // Midnight blue
	Theatrical: "#7851A9", // Royal purple
	Alternative: "#228B22", // Forest green
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

const VibesBarChart: React.FC<BarChartProps> = ({ data, title }) => {
	if (!data || Object.keys(data).length === 0) {
		return (
			<div className="h-full flex flex-col font-inter">
				{title && <h3 className="text-white text-center mb-4">{title}</h3>}
				<div className="flex-grow relative min-h-[300px]">
					<div className="absolute inset-0 flex items-center justify-center">
						<p className="text-neutral-400">No vibe data available</p>
					</div>
				</div>
			</div>
		);
	}

	const sortedEntries = Object.entries(data)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	while (sortedEntries.length < 5) {
		sortedEntries.push(["Unknown", 0]);
	}

	const labels = sortedEntries.map(([vibe]) => vibe);
	const values = sortedEntries.map(([_, value]) => value);
	const backgroundColors = labels.map((vibe) => moodColors[vibe] || "#999999");

	const maxValue = Math.max(...values);
	const yAxisMax = Math.min(maxValue + 5, 100);

	const chartData = {
		labels,
		datasets: [
			{
				label: "Vibe Percentage",
				data: values,
				backgroundColor: backgroundColors,
				borderColor: backgroundColors.map((color) => color.replace("0.7", "1")),
				borderWidth: 1,
				borderRadius: 0,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: true,
				max: yAxisMax,
				ticks: {
					color: "#F7CFD8",
					callback: function (value: any) {
						return value + "%";
					},
				},
				grid: {
					color: "rgba(255, 255, 255, 0.1)",
				},
			},
			x: {
				ticks: {
					color: "#F7CFD8",
				},
				grid: {
					display: false,
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						const vibe = context.dataset.label || "";
						const value = context.raw || 0;
						const description = moodDescriptions[context.label] || "";
						return [`${vibe}: ${value}%`, description];
					},
				},
			},
		},
	};

	return (
		<div className="h-full flex flex-col">
			{title && <h3 className="text-white text-center mb-4">{title}</h3>}
			<div className="flex-grow relative min-h-[300px]">
				{labels.length > 0 ? (
					<Bar data={chartData} options={options} />
				) : (
					<div className="absolute inset-0 flex items-center justify-center">
						<p className="text-neutral-400">No vibe data available</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default VibesBarChart;
