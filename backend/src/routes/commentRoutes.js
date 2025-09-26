import express from "express";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/post/:postId", getComments);

// Authenticated routes
router.post("/", protect, createComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;
