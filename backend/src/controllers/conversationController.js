import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";

/**
 * Start a conversation
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

    // Check follow relationship
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

    // Always re-fetch with population
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "username avatar")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username avatar" },
      });

    // Fetch messages
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
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "username avatar")
      .populate("lastMessage");

    // Optionally include last few messages for previews
    // const convWithMessages = await Promise.all(
    //   conversations.map(async (c) => {
    //     const lastMsgs = await Message.find({ conversationId: c._id })
    //       .sort({ createdAt: -1 })
    //       .limit(2)
    //       .populate("sender", "username avatar");
    //     return { ...c.toObject(), previewMessages: lastMsgs.reverse() };
    //   })
    // );

    res.json({ success: true, conversations, userId: req.user._id });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Get messages from a conversation
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
