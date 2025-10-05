// src/socket/chatSocket.js
import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";

/**
 * chatSocket(io, socket)
 * -------------------------
 * Handles all realtime chat events.
 * - join_conversations (with membership check)
 * - send_message (secure + ack)
 * - mark_as_read (seen receipts)
 * - typing / stop_typing (safe)
 */
export default function chatSocket(io, socket) {
  const userId = socket.user?._id;
  const username = socket.user?.username || "UnknownUser";

  if (!userId) {
    console.warn("⚠️ Socket connected without valid user");
    return;
  }

  console.log(`✅ Chat socket connected for ${username} (${userId})`);

  /**
   * Helper: ensure user participates in conversation
   */
  async function ensureMember(conversationId) {
    const conv = await Conversation.findById(conversationId).select(
      "participants"
    );
    if (!conv) return false;
    return conv.participants.some((p) => p.toString() === userId.toString());
  }

  /**
   * JOIN CONVERSATION ROOMS
   * ---------------------------------
   * Client emits: socket.emit("join_conversations", [ids])
   */
  socket.on("join_conversations", async (conversationIds = [], ack) => {
    try {
      const ids = (
        Array.isArray(conversationIds) ? conversationIds : []
      ).filter((id) => typeof id === "string");

      if (!ids.length) return ack?.({ ok: true, joined: [] });

      // Verify membership for each conversation
      const allowed = await Conversation.find({
        _id: { $in: ids },
        participants: userId,
      }).select("_id");

      const joined = [];
      for (const c of allowed) {
        socket.join(c._id.toString());
        joined.push(c._id.toString());
      }

      console.log(`👥 ${username} joined ${joined.length} rooms`);
      ack?.({ ok: true, joined });
    } catch (err) {
      console.error("join_conversations error:", err);
      ack?.({ ok: false, error: "Failed to join conversations" });
    }
  });

  /**
   * SEND MESSAGE (Realtime)
   * ---------------------------------
   * socket.emit("send_message", { conversationId, content }, ack)
   */
  socket.on("send_message", async ({ conversationId, content }, ack) => {
    try {
      if (!conversationId || !content?.trim()) {
        return ack?.({ ok: false, error: "Invalid message data" });
      }

      const isMember = await ensureMember(conversationId);
      if (!isMember) {
        return ack?.({ ok: false, error: "Not authorized for this chat" });
      }

      // 1️⃣ Create message
      const msg = await Message.create({
        conversationId,
        sender: userId,
        content: content.trim(),
        readBy: [userId],
      });

      // 2️⃣ Update conversation’s lastMessage & timestamp
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: msg._id, updatedAt: new Date() },
        { new: true }
      ).populate("participants", "_id username avatar");

      // 3️⃣ Populate sender info for frontend
      const populatedMsg = await msg.populate("sender", "username avatar");

      // 4️⃣ Emit to the conversation room (both participants receive)
      io.to(conversationId.toString()).emit("new_message", populatedMsg);
      console.log(`📡 ${username} → room ${conversationId}: ${content}`);

      // 5️⃣ Optional: private alert to recipient’s user room
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

      ack?.({ ok: true, message: populatedMsg });
    } catch (err) {
      console.error("send_message socket error:", err);
      ack?.({ ok: false, error: "Server error" });
    }
  });

  /**
   * MARK AS READ (Seen)
   * ---------------------------------
   * socket.emit("mark_as_read", { conversationId }, ack)
   */
  socket.on("mark_as_read", async ({ conversationId }, ack) => {
    try {
      const isMember = await ensureMember(conversationId);
      if (!isMember) return ack?.({ ok: false, error: "Not authorized" });

      await Message.updateMany(
        { conversationId, readBy: { $ne: userId } },
        { $push: { readBy: userId } }
      );

      const seenData = { conversationId, userId, seenAt: new Date() };
      io.to(conversationId.toString()).emit("seen", seenData);
      ack?.({ ok: true });
    } catch (err) {
      console.error("mark_as_read socket error:", err);
      ack?.({ ok: false, error: "Server error" });
    }
  });

  /**
   * TYPING INDICATORS
   * ---------------------------------
   */
  socket.on("typing", async ({ conversationId }) => {
    try {
      const isMember = await ensureMember(conversationId);
      if (isMember) {
        socket
          .to(conversationId.toString())
          .emit("typing", { userId, conversationId });
      }
    } catch (err) {
      console.error("typing socket error:", err);
    }
  });

  socket.on("stop_typing", async ({ conversationId }) => {
    try {
      const isMember = await ensureMember(conversationId);
      if (isMember) {
        socket
          .to(conversationId.toString())
          .emit("stop_typing", { userId, conversationId });
      }
    } catch (err) {
      console.error("stop_typing socket error:", err);
    }
  });

  /**
   * OPTIONAL: Emit when a conversation or message is deleted via REST
   * (You’d call io.to(conversationId).emit(...) from the REST controller)
   */

  socket.on("disconnect", () => {
    console.log(`❌ ${username} disconnected from chat`);
  });
}
