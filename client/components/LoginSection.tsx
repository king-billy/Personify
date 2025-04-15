"use client";

import { MIDDLEWARE_PORT } from "@/lib/constants";

export default function LoginSection() {
	const handleLoginClick = () => {
		window.location.href = `http://localhost:${MIDDLEWARE_PORT}/auth/login`;
	};

	return (
		<div className="mt-12">
			<button
				onClick={handleLoginClick}
				className="bg-white text-black py-3 px-12 rounded-full font-medium text-lg hover:bg-gray-300 transition cursor-pointer"
			>
				Login with Spotify
			</button>
		</div>
	);
}
