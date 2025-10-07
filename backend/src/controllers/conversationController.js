import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";
import mongoose from "mongoose";
/**
 * Start a conversation
 * ----------------------
 * - Only allowed if you follow the target user.
 * - Finds or creates the conversation.
 * - Returns conversation + existing messages.
 */
export const startConversation = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user._id;

    if (!targetUserId) {
      return res
        .status(400)
        .json({ success: false, error: "targetUserId is required" });
    }

    if (currentUserId.toString() === targetUserId.toString()) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot start a chat with yourself" });
    }

    // ✅ Ensure target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, error: "Target user not found" });
    }

    // ✅ Optional: ensure following relationship
    const currentUser = await User.findById(currentUserId).populate(
      "following"
    );
    const isFollowing = currentUser.following.some(
      (f) => f._id.toString() === targetUserId.toString()
    );

    if (!isFollowing) {
      return res.status(403).json({
        success: false,
        error: "You must follow this user to start a chat",
      });
    }

    // ✅ Look for existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId], $size: 2 },
    });

    // ✅ Handle existing conversation logic
    if (conversation) {
      const deletedFor =
        conversation.deletedFor?.map((id) => id.toString()) || [];

      const deletedForCurrent = deletedFor.includes(currentUserId.toString());
      const deletedForTarget = deletedFor.includes(targetUserId.toString());

      if (deletedForCurrent && deletedForTarget) {
        // 🆕 Both deleted → create a fresh one
        await conversation.deleteOne();
        conversation = await Conversation.create({
          participants: [currentUserId, targetUserId],
          status: "one_way",
        });
      } else if (deletedForCurrent && !deletedForTarget) {
        // 🔄 Only current user deleted → restore for them
        conversation.deletedFor = conversation.deletedFor.filter(
          (id) => id.toString() !== currentUserId.toString()
        );
        await conversation.save();
      }

      // ✅ Re-populate before returning
      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "username avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username avatar" },
        });

      const messages = await Message.find({ conversationId: conversation._id })
        .populate("sender", "username avatar")
        .sort({ createdAt: 1 });

      return res.json({ success: true, conversation, messages });
    }

    // 🆕 No conversation exists → create new
    const newConversation = await Conversation.create({
      participants: [currentUserId, targetUserId],
      status: "one_way",
    });

    const populatedConversation = await Conversation.findById(
      newConversation._id
    )
      .populate("participants", "username avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username avatar" },
      });

    return res.json({
      success: true,
      conversation: populatedConversation,
      messages: [],
    });
  } catch (err) {
    console.error("startConversation error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Get all conversations for current user
 * ---------------------------------------
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(userId),
      deletedFor: { $ne: userId },
    })
      .populate("participants", "username avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username avatar" },
      })
      .sort({ updatedAt: -1 })
      .lean();

    // ✅ For each conversation, count how many messages are not read by current user
    const convWithUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          readBy: { $ne: userId },
        });
        return { ...c, unreadCount };
      })
    );

    res.json({ success: true, conversations: convWithUnread, userId });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Get messages from a conversation
 * ----------------------------------
 */
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params; // conversationId

    const messages = await Message.find({ conversationId: id })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Send message (REST fallback)
 * -------------------------------
 * - For clients that can’t use sockets.
 * - Saves message and updates lastMessage.
 */
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // conversationId
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Message content required" });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    }

    // Restore chat visibility for anyone who previously deleted it
    if (conversation.deletedFor?.length > 0) {
      // always restore for sender
      conversation.deletedFor = conversation.deletedFor.filter(
        (uid) => uid.toString() !== req.user._id.toString()
      );

      // also restore for receiver, if they had hidden it
      const receiverId = conversation.participants.find(
        (p) => p.toString() !== req.user._id.toString()
      );
      if (receiverId) {
        conversation.deletedFor = conversation.deletedFor.filter(
          (uid) => uid.toString() !== receiverId.toString()
        );
      }

      await conversation.save();
    }

    // Ensure user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: "You are not part of this conversation",
      });
    }

    const msg = await Message.create({
      conversationId: id,
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    });

    await Conversation.findByIdAndUpdate(id, {
      lastMessage: msg._id,
    });

    const populated = await msg.populate("sender", "username avatar");
    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Mark all messages as read
 * ----------------------------
 * - Used if sockets aren’t connected.
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params; // conversationId

    await Message.updateMany(
      { conversationId: id, readBy: { $ne: req.user._id } },
      { $push: { readBy: req.user._id } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("markMessagesAsRead error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Delete a message
 * -------------------
 * - Only the sender can delete their own message.
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // only the sender can delete globally
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.deleted = true;
    await message.save();

    // notify all participants in that conversation
    req.io.to(message.conversationId.toString()).emit("message_deleted", {
      messageId,
      conversationId: message.conversationId,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ deleteMessage error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

/**
 * Hide a conversation
 * ------------------------
 * - Removes conversation ONLY for the user.
 *
 */
export const hideConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    }

    // only participants can modify
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    // hide for current user
    if (!conversation.deletedFor.includes(userId)) {
      conversation.deletedFor.push(userId);
      await conversation.save();
    }

    // if both users deleted → permanently delete
    if (conversation.deletedFor.length === conversation.participants.length) {
      await conversation.deleteOne(); // triggers cascade to messages
    }

    res.json({
      success: true,
      message: "Conversation hidden for current user",
    });
  } catch (err) {
    console.error("hideConversation error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
