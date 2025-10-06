import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  hideConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

router.use(protect);

router.post("/", startConversation);
router.get("/", getConversations);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);
router.patch("/:id/read", markMessagesAsRead);
router.patch("/:id/hide", hideConversation);
router.delete("/message/:messageId", deleteMessage);

export default router;
