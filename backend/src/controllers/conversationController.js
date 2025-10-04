import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";

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

    // Check follow relationship (you must follow them)
    const currentUser = await User.findById(currentUserId).populate(
      "following"
    );
    const isFollowing = currentUser.following.some(
      (f) => f._id.toString() === targetUserId
    );

    if (!isFollowing) {
      return res.status(403).json({
        success: false,
        error: "You must follow this user to start a chat",
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUserId],
        status: "one_way",
      });
    }

    // Populate participants and lastMessage
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "username avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username avatar" },
      });

    // Fetch existing messages
    const messages = await Message.find({ conversationId: conversation._id })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    return res.json({ success: true, conversation, messages });
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
      participants: userId,
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

    const msg = await Message.findById(messageId);
    if (!msg)
      return res
        .status(404)
        .json({ success: false, error: "Message not found" });

    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own messages",
      });
    }

    await msg.deleteOne();

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Delete a conversation
 * ------------------------
 * - Removes conversation + all its messages.
 * - Only participants can delete.
 */
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params; // conversationId

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: "You are not a participant in this conversation",
      });
    }

    await Message.deleteMany({ conversationId: id });
    await conversation.deleteOne();

    res.json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    console.error("deleteConversation error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
