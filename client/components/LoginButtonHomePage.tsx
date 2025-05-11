"use client";

const LoginButtonHomePage = () => {
	const handleLoginClick = () => {
		window.location.href = `/login`;
	};

	return (
		<div className="mt-12">
			<button
				onClick={handleLoginClick}
				className="bg-white text-black py-3 px-12 rounded-full font-large font-inter text-2xl hover:bg-gray-300 transition cursor-pointer"
			>
				Login
			</button>
		</div>
	);
};

export default LoginButtonHomePage;
