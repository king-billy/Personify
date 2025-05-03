import { MIDDLEWARE_PORT, SITE_ACCESS } from "@/lib/constants";
import { useEffect, useState } from "react";

export interface FeedbackCommentInterface {
	id: string;
	user_id: string;
	content: string;
	date_added: string;
	parent_comment_id: string | null;
	author?: {
		user_id: string;
		email: string;
	};
	replies?: FeedbackCommentInterface[];
}

export interface FeedbackInterface {
	id: string;
	user_id: string;
	content: string;
	upvotes: number;
	downvotes: number;
	created_at: string;
	updated_at: string;
	owner?: {
		user_id: string;
		email: string;
	};
	comments?: FeedbackCommentInterface[];
}

export const useFeedbackData = <T>(endpoint: string) => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const token = localStorage.getItem(SITE_ACCESS);
				if (!token) {
					throw new Error("Missing access token");
				}

				const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}${endpoint}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					throw new Error(`Failed to fetch feedback: ${res.status}`);
				}

				const json = await res.json();
				setData(json);
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Unknown error");
			} finally {
				setLoading(false);
			}
		})();
	}, [endpoint]);

	return {
		data,
		loading,
		error,
	};
};
