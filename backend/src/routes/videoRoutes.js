import express from "express";
import {
  createVideo,
  getVideoById,
  getVideosByUser,
  updateVideo,
  deleteVideo,
  incrementView,
  likeVideo,
  unlikeVideo,
  getAllVideos,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllVideos);
router.get("/user/:userId", getVideosByUser);
router.get("/:id", getVideoById);
router.patch("/:id/view", incrementView);

// Private
router.post("/", protect, createVideo);
router.put("/:id", protect, updateVideo);
router.delete("/:id", protect, deleteVideo);
router.patch("/:id/like", protect, likeVideo);
router.patch("/:id/unlike", protect, unlikeVideo);
export default router;
