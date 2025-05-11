"use client";

import FeedbackCard from "@/components/FeedbackCard";
import HeaderComponent from "@/components/HeaderComponent";
import { useAccountData } from "@/hooks/useAccountData";
import { FeedbackInterface, useFeedbackData } from "@/hooks/useFeedbackData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FeedbacksPage = () => {
	const router = useRouter();

	const { data: userData, loading: userLoading, error: userError } = useAccountData<{ user: any }>("/auth/me");

	const {
		data: feedbackData,
		loading: feedbackLoading,
		error: feedbackError,
	} = useFeedbackData<{ feedbacks: FeedbackInterface[] }>("/feedback");

	// checking authentication with user account
	useEffect(() => {
		if (userError) {
			router.replace("/");
		}
	}, [userData, userError, router]);

	if (feedbackLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-lg">Loading feedback...</p>
			</div>
		);
	}

	if (feedbackError) {
		return (
			<div className="min-h-screen flex items-center justify-center text-red-600">
				<p>Error: {feedbackError}</p>
			</div>
		);
	}

	const feedbacks = feedbackData?.feedbacks || [];

	const renderPlaceholder = () => {
		return (
			<div className="min-h-[300px] bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
				<p className="text-center text-gray-500 text-lg">
					<span>No feedback yet. Be the first to contribute!</span>
				</p>
			</div>
		);
	};

	const renderFeedbacks = () => {
		return feedbacks.map((fb) => {
			return <FeedbackCard key={fb.id} feedback={fb} linkToDetail />;
		});
	};

	return (
		<>
			<HeaderComponent />
			<div className="w-screen min-h-screen p-6 md:p-6">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-bold mb-8">Community Feedback</h1>
					<div className="space-y-6">{feedbacks.length === 0 ? renderPlaceholder() : renderFeedbacks()}</div>
				</div>
			</div>
		</>
	);
};

export default FeedbacksPage;
