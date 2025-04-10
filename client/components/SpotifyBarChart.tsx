"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

const imageCache: Record<string, HTMLImageElement> = {};

const imagePlugin = {
	id: "artistImages",
	afterDraw(chart: any) {
		const { ctx, chartArea, scales } = chart;
		const yAxis = scales.y;
		const customData = chart.options.plugins.customImageData;

		if (!ctx || !chart.config.data.labels || !customData) return;

		// Disable native labels
		yAxis.ticks.display = false;

		customData.forEach((artist: any, index: number) => {
			if (!artist?.image || !artist?.name) return;

			const yPos = yAxis.getPixelForTick(index);
			const xOffset = chartArea.left - 30; // offset by 30 pixels

			// Draw image (cache the rendering)
			if (!imageCache[artist.image]) {
				const img = new Image();
				img.src = artist.image;
				imageCache[artist.image] = img;
			}

			const img = imageCache[artist.image];

			const drawImage = () => {
				// Final drawing logic
				ctx.save();
				ctx.beginPath();
				ctx.arc(xOffset, yPos, 16, 0, Math.PI * 2); // 32x32 circle
				ctx.clip();
				ctx.drawImage(img, xOffset - 16, yPos - 16, 32, 32); // image left of center
				ctx.restore();
			};

			if (img.complete) drawImage();
			else img.onload = drawImage;

			ctx.fillStyle = "#F7CFD8";
			ctx.font = "14px sans-serif";
			ctx.textBaseline = "middle";
			ctx.fillText(artist.name, xOffset + 40, yPos); // offset the texts by 40 pixels
		});
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
}

/**
 * This will be used to render top artists and top genres
 * @param BarChartProps
 * @returns
 */
const SpotifyBarChart: React.FC<BarChartProps> = (props) => {
	const { data, labelKey, bgColor = "rgba(59, 130, 246, 0.6)" } = props;

	const chartData = {
		labels: data.map((item) => item[labelKey] as string),
		datasets: [
			{
				label: "Count",
				data: data.length > 0 ? data.map((item) => item.count) : [0],
				backgroundColor: bgColor,
			},
		],
	};

	const options = {
		indexAxis: "y" as const,
		responsive: true,
		layout: {
			padding: {
				left: 60,
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
			},
			y: {
				ticks: {
					display: false,
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
			customImageData: labelKey === "name" ? data : null,
		},
	};

	return data.length === 0 ? (
		<div className="h-full min-h-[200px] flex items-center justify-center">
			<p className="text-center text-med text-neutral-400">No data available</p>
		</div>
	) : (
		<Bar data={chartData} options={options} />
	);
};

export default SpotifyBarChart;
