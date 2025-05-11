import { Router } from "express";
import { supabase } from "../supabase";

const authRouter = Router();

/**
 * Register route with Supabase
 */
authRouter.post("/register", async (req, res) => {
	const { email, password } = req.body;

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) {
		res.status(400).json({ error: error.message });
		return;
	}

	res.status(200).json({
		message: "Registration successful",
		data,
	});
});

/**
 * Login route with Supabase
 */
authRouter.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error || !data.user) {
		res.status(400).json({ error: error?.message || "Login failed" });
		return;
	}

	const { id: uid, email: userEmail, user_metadata } = data.user;
	const displayName = user_metadata?.full_name ?? null;

	// Insert into users table only if not already there
	const { data: existingUser, error: userCheckError } = await supabase.from("users").select("user_id").eq("user_id", uid).single();

	if (userCheckError && userCheckError.code !== "PGRST116") {
		console.error("Error checking existing user:", userCheckError.message);
		res.status(500).json({ error: "Failed to check user profile" });
		return;
	}

	if (!existingUser) {
		const { error: insertError } = await supabase.from("users").insert({
			user_id: uid,
			email: userEmail,
			display_name: displayName,
		});

		if (insertError) {
			console.error("Error inserting user profile:", insertError.message);
			res.status(500).json({ error: "Failed to create user profile" });
			return;
		}
	}

	res.status(200).json({
		message: "Login successful",
		data,
	});
});

/**
 * Get currently logged-in user info
 */
authRouter.get("/me", async (req, res) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		res.status(401).json({
			error: "Missing Authorization header",
		});

		return;
	}

	const token = authHeader.split(" ")[1]; // "Bearer <token>"

	const { data, error } = await supabase.auth.getUser(token);

	if (error || !data?.user) {
		res.status(401).json({
			error: "Invalid or expired token",
		});

		return;
	}

	res.status(200).json({
		message: "User fetched successfully",
		user: data.user,
	});
});

/**
 * Get user based on id
 */
authRouter.get("/getUser/:id", async (req, res) => {
	const { id } = req.params;

	const { data, error } = await supabase.from("users").select("user_id, email, display_name").eq("user_id", id).single();

	if (error) {
		console.error("Error fetching user:", error.message);
		res.status(404).json({ error: "User not found" });
		return;
	}

	res.status(200).json({ user: data });
});

export default authRouter;
