import express from "express";
import {
  getNotifications,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read", protect, markAllAsRead);

export default router;
