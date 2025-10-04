import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";

export default function chatSocket(io, socket) {
  const userId = socket.user?._id;

  /**
   * Join all conversation rooms that the user participates in
   */
  socket.on("join_conversations", (conversationIds) => {
    conversationIds.forEach((cId) => socket.join(cId.toString()));
  });

  /**
   * Send message (real-time)
   * -------------------------
   * - Create message in DB
   * - Update conversation.lastMessage
   * - Emit `new_message` event to both participants
   * - If recipient is offline, unread count will be calculated when they reconnect
   */
  socket.on("send_message", async ({ conversationId, content }) => {
    try {
      if (!content || !conversationId) return;

      // 1️⃣ Create message
      const msg = await Message.create({
        conversationId,
        sender: userId,
        content,
        readBy: [userId],
      });

      // 2️⃣ Update conversation’s lastMessage & timestamp
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: msg._id, updatedAt: new Date() },
        { new: true }
      ).populate("participants", "_id username avatar");

      // 3️⃣ Populate sender for UI
      const populatedMsg = await msg.populate("sender", "username avatar");

      // 4️⃣ Emit new message to both users (joined in the same room)
      io.to(conversationId.toString()).emit("new_message", populatedMsg);

      // 5️⃣ Optional: If recipient is online in their private room, emit an alert
      const recipient = conversation.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      if (recipient) {
        io.to(recipient._id.toString()).emit("chat_alert", {
          conversationId,
          fromUser: msg.sender,
          preview: msg.content.slice(0, 100),
        });
      }
    } catch (err) {
      console.error("send_message socket error:", err);
    }
  });

  /**
   * Mark messages as read
   * -----------------------
   * - Updates all messages not read by this user
   * - Notifies the sender that the messages were seen
   */
  socket.on("mark_as_read", async ({ conversationId }) => {
    try {
      await Message.updateMany(
        { conversationId, readBy: { $ne: userId } },
        { $push: { readBy: userId } }
      );

      io.to(conversationId.toString()).emit("seen", {
        conversationId,
        userId,
        seenAt: new Date(),
      });
    } catch (err) {
      console.error("mark_as_read socket error:", err);
    }
  });

  /**
   * Typing indicators
   */
  socket.on("typing", ({ conversationId }) => {
    socket
      .to(conversationId.toString())
      .emit("typing", { userId, conversationId });
  });

  socket.on("stop_typing", ({ conversationId }) => {
    socket
      .to(conversationId.toString())
      .emit("stop_typing", { userId, conversationId });
  });
}
