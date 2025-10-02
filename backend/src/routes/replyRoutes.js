import express from "express";
import {
  createReply,
  updateReply,
  deleteReply,
  toggleLikeReply,
} from "../controllers/replyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReply);
router.put("/:commentId/:replyId", protect, updateReply);
router.delete("/:commentId/:replyId", protect, deleteReply);
router.patch("/:commentId/:replyId/like", protect, toggleLikeReply);
export default router;
