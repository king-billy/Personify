"use client";

import { usePathname, useRouter } from "next/navigation";

const FeedbackButton: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();

	const isOnFeedbackPage = pathname.includes("/feedback");

	const handleClick = () => {
		router.push(isOnFeedbackPage ? "/dashboard" : "/feedback");
	};

	return (
		<div className="flex items-center justify-center" onClick={handleClick}>
			<span className="text-sm font-bold cursor-pointer hover:underline">
				{isOnFeedbackPage ? "Dashboard" : "Feedback"}
			</span>
		</div>
	);
};

export default FeedbackButton;
