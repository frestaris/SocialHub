import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use("/auth", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
