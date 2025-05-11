"use client";

import HeaderComponent from "@/components/HeaderComponent";
import ViewAllFeedbackButton from "@/components/ViewAllFeedbackButton";
import { useAccountData } from "@/hooks/useAccountData";
import { useSpotifyData } from "@/hooks/useSpotifyData";
import { MIDDLEWARE_PORT, SITE_ACCESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FeedbackPage = () => {
	const router = useRouter();

	const { data: userData, loading: userLoading, error: userError } = useAccountData<{ user: any }>("/auth/me");

	const {
		data: spotifyUserData,
		error: spotifyFetchError,
		loading: spotifyLoading,
	} = useSpotifyData<any>(`/me/profile`);

	const [accountAuthChecked, setAccountAuthChecked] = useState<boolean>(false);

	const [feedback, setFeedback] = useState<string>("");
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// checking authentication with user account
	useEffect(() => {
		if (userError) {
			router.replace("/");
		}

		setAccountAuthChecked(true);
	}, [userData, userError, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!feedback.trim()) {
			setError("Feedback cannot be empty.");
			return;
		}

		const token = localStorage.getItem(SITE_ACCESS);
		if (!token) {
			setError("User is not authenticated.");
			return;
		}

		try {
			setSubmitting(true);

			const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}/feedback`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content: feedback }),
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result?.error || "Something went wrong while submitting feedback.");
			}

			setFeedback("");
			router.push("/feedbacks");
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Failed to submit feedback.");
		} finally {
			setSubmitting(false);
		}
	};

	if (!accountAuthChecked) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Checking authentication...</p>
			</div>
		);
	}

	return (
		<>
			<HeaderComponent />
			<div className="w-screen min-h-screen p-6 md:p-6">
				<div className="max-w-7xl mx-auto">
					<ViewAllFeedbackButton />
					<div className="bg-white rounded-lg shadow-md p-6 md:p-6 mt-5">
						<h1 className="text-3xl text-black font-bold mb-6 text-center">
							<span>Submit your feedback, {spotifyUserData?.display_name ?? userData?.user.email}</span>
						</h1>
						<form onSubmit={handleSubmit} className="space-y-4">
							<textarea
								value={feedback}
								onChange={(e) => setFeedback(e.target.value)}
								placeholder="Write your feedback here..."
								className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
								required
							/>
							{error && <p className="text-red-500 text-sm">{error}</p>}
							<button
								type="submit"
								disabled={submitting}
								className="w-full bg-black text-white py-3 rounded cursor-pointer hover:bg-gray-800 transition disabled:opacity-50"
							>
								{submitting ? "Submitting..." : "Submit Feedback"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default FeedbackPage;
