import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startConversation,
  getConversations,
  getMessages,
} from "../controllers/conversationController.js";

const router = express.Router();

// Start new chat
router.post("/", protect, startConversation);

// List all conversations for logged-in user
router.get("/", protect, getConversations);

// Get messages in a conversation
router.get("/:id/messages", protect, getMessages);

export default router;
