import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  getUserFeed,
  incrementPostViews,
  toggleLikePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/user/:userId", getPostsByUser);
router.get("/feed/:userId", getUserFeed);
router.get("/:id", getPostById);
router.patch("/:id/views", incrementPostViews);

// Private routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.patch("/:id/like", protect, toggleLikePost);

export default router;
