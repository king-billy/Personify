import { FeedbackInterface } from "@/hooks/useFeedbackData";
import { SITE_ACCESS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/time";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa6";

interface FeedbackCardProps {
	feedback: FeedbackInterface;
	linkToDetail?: boolean;
	showFullContent?: boolean;
}

interface VotesState {
	upvotes: number;
	downvotes: number;
}

const FeedbackCard: React.FC<FeedbackCardProps> = (props) => {
	const { feedback, linkToDetail = false, showFullContent = false } = props;

	const router = useRouter();

	const [voteCounter, setVoteCounter] = useState<VotesState>({
		upvotes: feedback.upvotes,
		downvotes: feedback.downvotes,
	});

	const handleVote = async (type: "upvote" | "downvote") => {
		try {
			const token = localStorage.getItem(SITE_ACCESS);
			if (!token) {
				return;
			}

			const res = await fetch(`http://localhost:6969/feedback/${feedback.id}/${type}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error(`Error voting.`);
			}

			const { feedback: updatedFeedback } = await res.json();

			// update local vote state
			setVoteCounter({
				upvotes: updatedFeedback.upvotes,
				downvotes: updatedFeedback.downvotes,
			});
		} catch (err) {
			console.error("Vote failed", err);
		}
	};

	const renderCardContentHeader = () => {
		return (
			<div className="text-sm text-gray-800 flex items-center justify-start gap-2">
				<span className="font-bold">{feedback.owner?.email ?? "User"}</span>
				<span>{formatRelativeTime(new Date(feedback.created_at))}</span>
			</div>
		);
	};

	const renderCardVoteContainer = () => {
		const count = voteCounter.upvotes - voteCounter.downvotes;

		return (
			<div className="flex items-center justify-center gap-2">
				<span
					className="text-black pl-1"
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();

						handleVote("upvote");
					}}
				>
					<FaRegThumbsUp className="cursor-pointer" />
				</span>
				<span className="text-black">{count}</span>
				<span
					className="text-black pr-1"
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();

						handleVote("downvote");
					}}
				>
					<FaRegThumbsDown className="cursor-pointer" />
				</span>
			</div>
		);
	};

	const renderCommentCounter = () => {
		return <></>;
	};

	const renderCardContentFooter = () => {
		return (
			<div className="mt-10 flex items-center justify-center gap-2">
				{renderCardVoteContainer()}
				<span className="w-[4px] h-4 border-l border-solid border-gray" />
				{renderCommentCounter()}
			</div>
		);
	};

	return (
		<div
			className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-start gap-2 ${linkToDetail ? "hover:opacity-90 cursor-pointer" : ""} transition`}
			onClick={() => {
				if (linkToDetail) {
					router.push(`/feedbacks/${feedback.id}`);
				}
			}}
		>
			{renderCardContentHeader()}
			<p className={`text-gray-800 text-lg ${showFullContent ? "" : "line-clamp-2"}`}>{feedback.content}</p>
			{renderCardContentFooter()}
		</div>
	);
};

export default FeedbackCard;
