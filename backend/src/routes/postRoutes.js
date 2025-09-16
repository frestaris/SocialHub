import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getPosts);
router.get("/:id", getPostById);

// Private
router.post("/", protect, createPost);

export default router;
