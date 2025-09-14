import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

// Import routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";

const app = express();
dotenv.config();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/video", videoRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
