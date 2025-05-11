"use client";

import FeedbackCard from "@/components/FeedbackCard";
import FeedbackComments from "@/components/FeedbackComments";
import HeaderComponent from "@/components/HeaderComponent";
import ViewAllFeedbackButton from "@/components/ViewAllFeedbackButton";
import { useAccountData } from "@/hooks/useAccountData";
import { FeedbackInterface, useFeedbackData } from "@/hooks/useFeedbackData";
import { useParams, useRouter } from "next/navigation";
import { JSX, useEffect } from "react";

const FeedbackDetailPage = () => {
	const router = useRouter();

	const { id } = useParams() as { id: string };

	const { data: userData, loading: userLoading, error: userError } = useAccountData<{ user: any }>("/auth/me");

	const {
		data: feedbackData,
		loading: feedbackLoading,
		error: feedbackError,
	} = useFeedbackData<{ feedback: FeedbackInterface }>(`/feedback/${id}`);

	// checking authentication with user account
	useEffect(() => {
		if (userError) {
			router.replace("/");
		}
	}, [userData, userError, router]);

	if (feedbackLoading) return <p className="p-10">Loading feedback...</p>;

	const fb = feedbackData?.feedback;

	const renderFeedbackPlaceholder = (): JSX.Element => {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<div className="min-h-[100px] flex items-center justify-center text-gray-500">
					<p>Feedback not found or has been deleted.</p>
				</div>
			</div>
		);
	};

	const renderFeedbackContent = () => {
		if (!fb) return null;

		return (
			<>
				<FeedbackCard feedback={fb} linkToDetail={false} />
				<FeedbackComments feedback={fb} key={fb.id} />
			</>
		);
	};

	return (
		<>
			<HeaderComponent />
			<div className="w-screen min-h-screen p-6 md:p-6">
				<div className="max-w-7xl mx-auto space-y-5">
					<ViewAllFeedbackButton />
					{!feedbackError || fb ? renderFeedbackContent() : renderFeedbackPlaceholder()}
				</div>
			</div>
		</>
	);
};

export default FeedbackDetailPage;
