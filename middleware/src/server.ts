import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import supabaseRoutes from "./routes/auth";
import feedbackRoutes from "./routes/feedback";
import meRoutes from "./routes/me";
import spotifyAuthRoutes from "./routes/spotifyAuth";

dotenv.config();

const app = express();
const PORT = process.env.MIDDLEWARE_PORT || 6969;

app.use(cors());
app.use(express.json());

const logsDir = path.resolve(__dirname, "../logs");
const accessLogStreamPath = path.join(logsDir, "access.log");

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(accessLogStreamPath, { flags: "a" });

app.use(
	morgan("combined", {
		stream: accessLogStream,
	}),
);

// Supabase routes — handles user login and user register
app.use("/auth", supabaseRoutes);

// Spotify Authentication routes — handles connection to Spotify API
app.use("/spotify-auth", spotifyAuthRoutes);

// "Me" routes — handles getting user data in preparation for our vibe playlist generation
app.use("/me", meRoutes);

// Feedback routes
app.use("/feedback", feedbackRoutes);

// Index — output when accessing our port directly
// TASK: Needs better information
app.get("/", (_, res) => {
	res.send("Hey! Spotify Middleware is running!");
});

app.listen(PORT, () => {
	console.log(`\nServer running at http://localhost:${PORT}\n`);
});

export default app;
