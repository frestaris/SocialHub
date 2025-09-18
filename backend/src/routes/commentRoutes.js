import express from "express";
import {
  createComment,
  getComments,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /comments
router.post("/", protect, createComment);

// GET /comments/post/:postId
router.get("/post/:postId", getComments);

export default router;
