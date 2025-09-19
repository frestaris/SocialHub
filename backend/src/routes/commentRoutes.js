import express from "express";
import {
  createComment,
  getComments,
  updateComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /comments
router.post("/", protect, createComment);

router.get("/post/:postId", getComments);
router.put("/:id", protect, updateComment);

export default router;
