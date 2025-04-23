import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";

dotenv.config();

const app = express();
const PORT = process.env.MIDDLEWARE_PORT || 6969;

app.use(cors());
app.use(express.json());
app.use(
	morgan("combined", {
		stream: fs.createWriteStream(path.join(__dirname, "..logs/access.log"), { flags: "a" }),
	}),
);

// Authentication routes — handles user login and callback
app.use("/auth", authRoutes);

// "Me" routes — handles getting user data in preparation for our vibe playlist generation
app.use("/me", meRoutes);

// Index — output when accessing our port directly
// TASK: Needs better information
app.get("/", (_, res) => {
	res.send("Hey! Spotify Middleware is running!");
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
