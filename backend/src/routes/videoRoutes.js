import express from "express";
import {
  incrementView,
  likeVideo,
  unlikeVideo,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.patch("/:id/view", incrementView);

// Private
router.patch("/:id/like", protect, likeVideo);
router.patch("/:id/unlike", protect, unlikeVideo);
export default router;
