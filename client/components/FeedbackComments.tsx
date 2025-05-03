import { FeedbackCommentInterface, FeedbackInterface } from "@/hooks/useFeedbackData";
import { MIDDLEWARE_PORT } from "@/lib/constants";
import React, { useEffect, useState } from "react";

interface FeedbackCommentsInterface {
	feedback: FeedbackInterface;
}

interface FeedbackCommentThreadInterface {
	comment: FeedbackCommentInterface;
	allComments: FeedbackCommentInterface[];
	setReplyTo: (id: string | null) => void;
	replyTo: string | null;
	replyTexts: Record<string, string>;
	setReplyTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	handleComment: (e: React.FormEvent, parentId: string) => void;
	submitting: boolean;
}

const FeedbackCommentThread: React.FC<FeedbackCommentThreadInterface> = (props) => {
	const { comment, allComments, setReplyTo, replyTo, replyTexts, setReplyTexts, handleComment, submitting } = props;

	const [repliesOpen, setRepliesOpen] = useState<boolean>(false);

	const replies = allComments.filter((c) => c.parent_comment_id === comment.id);

	const handleSubmitReply = (e: React.FormEvent<HTMLFormElement>) => {
		handleComment(e, comment.id);
		setRepliesOpen(true);
	};

	const renderReplyTextbox = () => {
		if (replyTo !== comment.id) return null;

		return (
			<form onSubmit={handleSubmitReply} className="mt-2 mb-5 space-y-2">
				<textarea
					value={replyTexts[comment.id] || ""}
					onChange={(e) => {
						setReplyTexts((prev) => ({
							...prev,
							[comment.id]: e.target.value,
						}));
					}}
					className="w-full p-2 border border-gray-300 rounded text-black"
					placeholder="Write a reply..."
				/>
				<div className="flex gap-2">
					<button
						type="submit"
						disabled={submitting}
						className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
					>
						{submitting ? "Replying..." : "Reply"}
					</button>
					<button
						className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
						onClick={() => {
							setReplyTo(null);
							setReplyTexts((prev) => {
								const updated = { ...prev };
								delete updated[comment.id];
								return updated;
							});
						}}
					>
						Cancel
					</button>
				</div>
			</form>
		);
	};

	const renderNestedReplies = () => {
		if (!repliesOpen) return null;

		return (
			<ul className="mt-5">
				{replies.map((reply) => {
					return (
						<li className="ml-5" key={reply.id}>
							<FeedbackCommentThread
								key={reply.id}
								comment={reply}
								allComments={allComments}
								setReplyTo={setReplyTo}
								replyTo={replyTo}
								replyTexts={replyTexts}
								setReplyTexts={setReplyTexts}
								handleComment={handleComment}
								submitting={submitting}
							/>
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<div className="mb-5" key={comment.id}>
			<div className="mb-2 flex flex-col gap-1">
				<div className="text-xs text-gray-800 flex items-start justify-start gap-2">
					<span className="font-bold">{comment.author?.email ?? "User"}</span>
					<span>{new Date(comment.date_added).toLocaleString()}</span>
				</div>
				<p className="text-md text-gray-800">{comment.content}</p>
				<div className="text-xs text-gray-800 flex items-center justify-start gap-2">
					<span
						className="font-bold cursor-pointer hover:underline select-none"
						onClick={() => setReplyTo(comment.id)}
					>
						Reply
					</span>
					{replies.length > 0 && (
						<>
							<span className="h-[15px] border-l border-gray border-solid" />
							<span
								className="cursor-pointer hover:underline select-none"
								onClick={() => {
									setRepliesOpen((prev) => !prev);
								}}
							>
								{replies.length} View {replies.length === 1 ? "Reply" : "Replies"}
							</span>
						</>
					)}
				</div>
			</div>
			{replyTo === comment.id && renderReplyTextbox()}
			{renderNestedReplies()}
		</div>
	);
};

const FeedbackComments: React.FC<FeedbackCommentsInterface> = (props) => {
	const { feedback: fb } = props;

	const [comment, setComment] = useState<string>("");
	const [submitting, setSubmitting] = useState<boolean>(false);

	const [comments, setComments] = useState<FeedbackCommentInterface[]>([]);
	const [replyTo, setReplyTo] = useState<string | null>(null);
	const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

	const handleComment = async (e: React.FormEvent, parentId: string | null = null) => {
		e.preventDefault();
		const id = fb.id;
		const content = parentId ? replyTexts[parentId] : comment;
		const userToken = localStorage.getItem("site_access");

		if (!content?.trim()) return;

		try {
			setSubmitting(true);
			const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}/feedback/${id}/comment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${userToken}`,
				},
				body: JSON.stringify({
					content,
					parent_comment_id: parentId,
				}),
			});

			if (!res.ok) throw new Error("Failed to submit comment");

			const { comment: newComment } = await res.json();

			// Reset form input
			if (parentId) {
				setReplyTexts((prev) => {
					const updated = { ...prev };
					delete updated[parentId];
					return updated;
				});
			} else {
				setComment(""); // clear top-level comment
				setComments((prev) => [...prev, newComment]); // add to top-level
			}

			setReplyTo(null);
			fb.comments?.push(newComment); // for nested rendering
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		if (!fb.comments) return;

		const topLevel = fb.comments.filter((c) => {
			return c.parent_comment_id === null;
		});

		setComments(topLevel);
	}, [fb]);

	const renderFeedbackCommentsContent = () => {
		if (comments.length === 0) {
			return <p className="text-gray-500">No comments yet. Be the first to respond!</p>;
		}

		return (
			<ul className="space-y-3">
				{comments.map((comment) => {
					return (
						<li key={comment.id}>
							<FeedbackCommentThread
								comment={comment}
								allComments={fb.comments ?? []}
								setReplyTo={setReplyTo}
								replyTo={replyTo}
								replyTexts={replyTexts}
								setReplyTexts={setReplyTexts}
								handleComment={handleComment}
								submitting={submitting}
							/>
						</li>
					);
				})}
			</ul>
		);
	};

	const renderFeedbackCommentsForm = () => {
		return (
			<>
				{replyTo ? (
					<div className="text-sm text-gray-600">
						Replying to comment…{" "}
						<span className="text-blue-500 hover:underline cursor-pointer" onClick={() => setReplyTo(null)}>
							Cancel
						</span>
					</div>
				) : (
					<form
						onSubmit={(e) => {
							handleComment(e, null);
						}}
						className="mt-6 space-y-2"
					>
						<textarea
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="w-full p-3 border border-gray-300 rounded text-black"
							placeholder="Write a comment..."
						/>
						<button
							type="submit"
							disabled={submitting}
							className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
						>
							{submitting ? "Sending..." : "Send Comment"}
						</button>
					</form>
				)}
			</>
		);
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md mt-5">
			<h2 className="text-xl text-black font-bold mb-4">Comments</h2>
			{renderFeedbackCommentsContent()}
			{renderFeedbackCommentsForm()}
		</div>
	);
};

export default FeedbackComments;
