"use client";

import { MIDDLEWARE_PORT } from "@/lib/constants";
import React from "react";

interface FeatureGridDataInterface {
	name: string;
	detail: string;
	color: string;
}

const featuresGridData: FeatureGridDataInterface[] = [
	{
		name: "Insights",
		detail: "Understand your listening history on a deeper level.",
		color: "bg-pink-200",
	},
	{
		name: "Charts",
		detail: "See your results visualized and receive visual feedback.",
		color: "bg-yellow-200",
	},
	{
		name: "Trends",
		detail: "Compare your listening profile to other Spotify users.",
		color: "bg-green-200",
	},
	{
		name: "Feedback",
		detail: "Submit your feedback to us so we can improve your user experience!",
		color: "bg-teal-300",
	},
];

interface LandingPageInterface {
	isSpotifyConnected: boolean;
}

const LandingPage: React.FC<LandingPageInterface> = (props) => {
	const { isSpotifyConnected } = props;

	const scrollToDashboard = () => {
		const element = document.getElementById("dashboard");
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	const connectSpotify = () => {
		window.location.href = `http://localhost:${MIDDLEWARE_PORT}/spotify-auth/login`;
	};

	const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();

		if (isSpotifyConnected) {
			scrollToDashboard();
		} else {
			connectSpotify();
		}
	};

	return (
		<div className="min-h-screen bg-black text-white p-6 md:p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
					<div className="w-full md:w-1/2">
						<h1 className="font-bold text-5xl md:text-6xl mb-4 italic">Your energy</h1>
						<h1 className="font-bold text-5xl md:text-6xl mb-4 italic">Your vibes</h1>
						<h1 className="font-bold text-5xl md:text-6xl mb-8 italic">Your mood</h1>

						<p className="text-xl md:text-2xl mb-8 max-w-[420px]">
							Find out more about your music taste and personality below.
						</p>

						<button
							onClick={handleButtonClick}
							className="bg-white text-black font-light py-4 px-16 rounded-full text-xl hover:bg-gray-200 transition-colors cursor-pointer"
						>
							{isSpotifyConnected ? "Explore" : "Login with Spotify"}
						</button>
					</div>

					{/* Some Abstract Image */}
					<div className="w-full md:w-1/2 relative rounded-lg overflow-hidden">
						<div className="w-full h-[400px] md:h-[500px] overflow-hidden relative">
							{/* <div className="absolute w-1 h-2 bg-white top-0 left-0"></div>
							<div className="absolute w-1 h-2 bg-white top-0 right-0"></div>
							<div className="absolute w-1 h-2 bg-white bottom-0 left-0"></div>
							<div className="absolute w-1 h-2 bg-white bottom-0 right-0"></div> */}

							<div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-400 to-blue-300 opacity-90 rounded-xl">
								<div className="w-full h-full bg-[url('/abstract-pattern.png')] mix-blend-overlay"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
					{/* Insights */}
					<div className="bg-pink-200 text-black p-6 rounded-xl">
						<div className="text-7xl font-bold mb-4 text-white">01</div>
						<h2 className="text-3xl font-bold mb-2">Insights</h2>
						<p className="text-lg">Understand your listening history on a deeper level.</p>
					</div>

					{/* Charts */}
					<div className="bg-yellow-200 text-black p-6 rounded-xl">
						<div className="text-7xl font-bold mb-4 text-white">02</div>
						<h2 className="text-3xl font-bold mb-2">Charts</h2>
						<p className="text-lg">See your results visualized and receive visual feedback.</p>
					</div>

					{/* Trends */}
					<div className="bg-green-200 text-black p-6 rounded-xl">
						<div className="text-7xl font-bold mb-4 text-white">03</div>
						<h2 className="text-3xl font-bold mb-2">Trends</h2>
						<p className="text-lg">Compare your listening profile to other Spotify users.</p>
					</div>

					{/* Feedback */}
					<div className="bg-teal-300 text-black p-6 rounded-xl">
						<div className="text-7xl font-bold mb-4 text-white">04</div>
						<h2 className="text-3xl font-bold mb-2">Feedback</h2>
						<p className="text-lg">Submit your feedback to us so we can improve your user experience!</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
