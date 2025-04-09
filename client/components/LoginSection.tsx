"use client";

export default function LoginSection() {
	const handleLoginClick = () => {
		window.location.href = "http://localhost:6969/auth/login";
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
