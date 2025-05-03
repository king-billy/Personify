import { User } from "@supabase/supabase-js";
import { NextFunction, Request, Response, Router } from "express";
import { supabase } from "../supabase";

interface ExtendedRequestWithUser extends Request {
	user?: User;
}

// NOTE: (1) This select query will require multiple tables with proper RLS policies in each of them!
// (2) This select query will require access to "users" and "feedback_comments" tables
// (3) With (1) and (2), this select is querying joins and outputting nested tables
const FEEDBACK_SELECT_QUERY: string = `
	id,
	user_id,
	content,
	upvotes,
	downvotes,
	created_at,
	updated_at,
	owner:users(user_id, email, display_name),
	comments:feedback_comments(
		id,
		user_id,
		content,
		date_added,
		parent_comment_id,
		author:users(user_id, email, display_name),
		replies:feedback_comments(
			id,
			user_id,
			content,
			date_added,
			parent_comment_id,
			author:users(user_id, email)
		)
	)` as const;

const FEEDBACK_COMMENT_POST_SELECT_QUERY: string = `
	id,
	user_id,
	content,
	date_added,
	parent_comment_id,
	author:users(user_id, email, display_name),
	replies:feedback_comments(
		id,
		user_id,
		content,
		date_added,
		parent_comment_id,
		author:users(user_id, email)
	)` as const;

const feedbackRouter = Router();

/**
 * Middleware to check Supabase user
 */
const checkUser = async (req: ExtendedRequestWithUser, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.status(401).json({ error: "Missing authorization header" });
		return;
	}

	const token = authHeader.split(" ")[1];
	const { data, error } = await supabase.auth.getUser(token);

	if (error || !data?.user) {
		res.status(401).json({ error: "Invalid or expired token" });
		return;
	}

	req.user = data.user;
	next();
};

/**
 * POST /feedback - Create new feedback
 */
feedbackRouter.post("/", checkUser, async (req: ExtendedRequestWithUser, res) => {
	const { content } = req.body;

	if (!content) {
		res.status(400).json({ error: "Content is required" });
		return;
	}

	const { data, error } = await supabase
		.from("feedbacks")
		.insert({
			user_id: req.user.id,
			content,
		})
		.single();

	if (error) {
		res.status(500).json({ error: error.message });
		return;
	}

	res.status(201).json({ feedback: data });
});

/**
 * GET /feedback - Get all feedbacks
 */
feedbackRouter.get("/", async (req, res) => {
	const { data, error } = await supabase.from("feedbacks").select(FEEDBACK_SELECT_QUERY).order("created_at", { ascending: false });

	if (error) {
		res.status(500).json({ error: error.message });
		return;
	}

	res.status(200).json({ feedbacks: data });
});

/**
 * GET /feedback/:id - Get a specific feedback
 */
feedbackRouter.get("/:id", async (req, res) => {
	const { id } = req.params;

	const { data, error } = await supabase.from("feedbacks").select(FEEDBACK_SELECT_QUERY).eq("id", id).single();

	if (error || !data) {
		res.status(404).json({ error: "Feedback not found" });
		return;
	}

	res.status(200).json({ feedback: data });
});

/**
 * DELETE /feedback/:id - Delete feedback
 */
feedbackRouter.delete("/:id", checkUser, async (req: ExtendedRequestWithUser, res) => {
	const { id } = req.params;

	// Check ownership
	const { data: existingFeedback, error: findError } = await supabase.from("feedbacks").select("*").eq("id", id).single();

	if (findError || !existingFeedback) {
		res.status(404).json({ error: "Feedback not found" });
		return;
	}

	if (existingFeedback.user_id !== req.user.id) {
		res.status(403).json({ error: "You cannot delete this feedback" });
		return;
	}

	const { error } = await supabase.from("feedbacks").delete().eq("id", id);

	if (error) {
		res.status(500).json({ error: error.message });
		return;
	}

	res.status(204).send();
});

/**
 * POST /feedback/:id/comment - Comment on feedback
 * RLS is temporarily disabled — FIX
 */
feedbackRouter.post("/:id/comment", checkUser, async (req: ExtendedRequestWithUser, res) => {
	const { id } = req.params;
	const { content, parent_comment_id } = req.body;

	if (!content) {
		res.status(400).json({
			error: "Content is required",
		});

		return;
	}

	const insertPayload: any = {
		feedback_id: id,
		user_id: req.user.id,
		content,
	};

	if (parent_comment_id) {
		insertPayload["parent_comment_id"] = parent_comment_id;
	}

	const { data: insertData, error: insertError } = await supabase
		.from("feedback_comments")
		.insert(insertPayload)
		.select(FEEDBACK_COMMENT_POST_SELECT_QUERY)
		.single();

	if (insertError || !insertData) {
		res.status(500).json({
			error: insertError?.message ?? "Unknown insertion error",
		});

		return;
	}

	res.status(201).json({
		comment: insertData,
	});
});

/**
 * POST /feedback/:id/:voteType - Vote feedback
 */
feedbackRouter.post("/:id/:voteType", checkUser, async (req, res) => {
	const { id, voteType } = req.params;

	if (voteType !== "upvote" && voteType !== "downvote") {
		res.status(400).json({ error: "Invalid vote type" });
		return;
	}

	const voteColumn = voteType === "upvote" ? "upvotes" : "downvotes";

	// Step 1: Get current upvotes
	const { data: feedback, error: fetchError } = await supabase.from("feedbacks").select(voteColumn).eq("id", id).single();

	if (fetchError || !feedback) {
		res.status(404).json({ error: "Feedback not found" });
		return;
	}

	// Step 2: Increment
	const { data: updateFeedbackData, error: updateFeedbackError } = await supabase
		.from("feedbacks")
		.update({ [voteColumn]: feedback[voteColumn] + 1 })
		.eq("id", id)
		.select()
		.single();

	if (updateFeedbackError || !updateFeedbackData) {
		res.status(500).json({ error: updateFeedbackError.message });
		return;
	}

	res.status(200).json({ feedback: updateFeedbackData });
});

export default feedbackRouter;
