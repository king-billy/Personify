"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

const imageCache: Record<string, HTMLImageElement | null> = {};

const imagePlugin = {
	id: "artistImages",
	afterDraw(chart: any) {
		const { ctx, chartArea, scales } = chart;
		const yAxis = scales.y;
		const customData = chart.options.plugins.customImageData;
		const isGenreChart = chart.options.plugins.isGenreChart;

		if (!ctx || !chart.config.data.labels) return;

		// Disable native labels for artist charts only
		if (!isGenreChart) {
			yAxis.ticks.display = false;
		}

		// For artist charts, draw images and names
		if (customData && !isGenreChart) {
			customData.forEach((artist: any, index: number) => {
				if (!artist?.name) return;

				const yPos = yAxis.getPixelForTick(index);
				const xOffset = chartArea.left - 30;

				// Draw artist name
				ctx.fillStyle = "#F7CFD8";
				ctx.font = "14px sans-serif";
				ctx.textBaseline = "middle";
				ctx.fillText(artist.name, xOffset + 40, yPos);

				// Draw image if available
				if (artist?.image) {
					if (!imageCache[artist.image]) {
						const img = new Image();
						img.crossOrigin = "anonymous";
						img.src = artist.image;
						imageCache[artist.image] = img;

						img.onerror = () => {
							// If image fails to load, mark as null to avoid retries
							imageCache[artist.image] = null;
							console.warn(`Failed to load image for: ${artist.name}`);
						};
					}

					const img = imageCache[artist.image];

					if (img && img.complete && img.naturalHeight !== 0) {
						// Draw circle and image
						ctx.save();
						ctx.beginPath();
						ctx.arc(xOffset, yPos, 16, 0, Math.PI * 2);
						ctx.clip();
						ctx.drawImage(img, xOffset - 16, yPos - 16, 32, 32);
						ctx.restore();
					} else if (img) {
						// Set onload handler if image is still loading
						img.onload = () => {
							chart.update();
						};
					}
				}
			});
		}
	},
};

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, imagePlugin);

interface BarChartData {
	[key: string]: string | number;
}

interface BarChartProps {
	data: BarChartData[];
	labelKey: "name" | "genre";
	bgColor?: string;
	title?: string;
}

/**
 * This will be used to render top artists and top genres
 * @param BarChartProps
 * @returns
 */
const SpotifyBarChart: React.FC<BarChartProps> = (props) => {
	const { data, labelKey, bgColor = "rgba(59, 130, 246, 0.6)", title } = props;
	const isGenreChart = labelKey === "genre";

	const chartData = {
		labels: data.map((item) => item[labelKey] as string),
		datasets: [
			{
				label: isGenreChart ? "Genre Count" : "Artist Plays",
				data: data.length > 0 ? data.map((item) => item.count) : [0],
				backgroundColor: bgColor,
			},
		],
	};

	const options = {
		indexAxis: "y" as const,
		responsive: true,
		maintainAspectRatio: false, // This is already set correctly
		layout: {
			padding: {
				left: isGenreChart ? 0 : 60,
				right: 0,
				top: 0,
				bottom: 0,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: {
					color: "#F7CFD8",
				},
				grid: {
					color: "#555",
				},
				title: {
					display: true,
					text: isGenreChart ? "Number of Artists" : "Play Count",
					color: "#F7CFD8",
					font: {
						size: 14,
					},
				},
			},
			y: {
				ticks: {
					display: isGenreChart,
					color: "#F7CFD8",
					padding: isGenreChart ? 5 : 25,
					font: {
						size: 12,
					},
				},
				grid: {
					color: "#444",
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: !!title,
				text: title || "",
				color: "#F7CFD8",
				font: {
					size: 16,
				},
				padding: {
					top: 10,
					bottom: 10,
				},
			},
			customImageData: data,
			isGenreChart: isGenreChart,
			tooltip: {
				backgroundColor: "rgba(17, 24, 39, 0.95)",
				titleColor: "#F7CFD8",
				bodyColor: "#E5E7EB",
				borderColor: "rgba(255, 255, 255, 0.1)",
				borderWidth: 1,
				padding: 12,
				displayColors: false,
				callbacks: {
					title: (items: any[]) => {
						const index = items[0].dataIndex;
						return data[index][labelKey] as string;
					},
					label: (item: any) => {
						const value = item.raw;
						return [isGenreChart ? `🎵 ${value} artists` : `🎧 ${value} plays`, ""];
					},
				},
			},
		},
	};

	return data.length === 0 ? (
		<div className="h-full min-h-[200px] flex items-center justify-center">
			<p className="text-center text-med text-neutral-400">No data available</p>
		</div>
	) : (
		<div className="h-full w-full">
			<Bar data={chartData} options={options} />
		</div>
	);
};

export default SpotifyBarChart;
