import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";

/**
 * chatSocket(io, socket)
 * -------------------------
 * Handles all realtime chat events + presence tracking.
 */
export default function chatSocket(io, socket) {
  const userId = socket.user?._id;
  const username = socket.user?.username || "UnknownUser";

  if (!userId) {
    console.warn("⚠️ Socket connected without valid user");
    return;
  }

  // ======================================================
  // ONLINE STATUS
  // ======================================================
  try {
    User.findById(userId).then(async (user) => {
      if (!user) return;

      // respect privacy toggle
      if (user.showOnlineStatus) {
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        // broadcast to followers or everyone if needed
        io.emit("user_online", { userId, username, online: true });
      }
    });
  } catch (err) {
    console.error("Error updating online status:", err);
  }

  // ======================================================
  // Helper: ensure user participates in conversation
  // ======================================================
  async function ensureMember(conversationId) {
    const conv = await Conversation.findById(conversationId).select(
      "participants"
    );
    if (!conv) return false;
    return conv.participants.some((p) => p.toString() === userId.toString());
  }

  // ======================================================
  // JOIN CONVERSATION ROOMS
  // ======================================================
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

  // ======================================================
  // SEND MESSAGE
  // ======================================================
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

      // Restore chat if either participant had deleted it
      if (conversation.deletedFor?.length > 0) {
        conversation.deletedFor = conversation.deletedFor.filter(
          (uid) => uid.toString() !== userId.toString()
        );

        const receiver = conversation.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );
        if (receiver) {
          conversation.deletedFor = conversation.deletedFor.filter(
            (uid) => uid.toString() !== receiver._id.toString()
          );
        }

        await conversation.save();
      }

      // 3️⃣ Populate sender info for frontend
      const populatedMsg = await msg.populate("sender", "username avatar");

      io.to(conversationId.toString()).emit("new_message", populatedMsg);
      console.log(`📡 ${username} → room ${conversationId}: ${content}`);

      // 5️⃣ Optional: private alert to recipient’s user room
      const recipient = conversation.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      if (recipient && !socket.rooms.has(recipient._id.toString())) {
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

  // ======================================================
  // MARK AS READ
  // ======================================================
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

  // ======================================================
  // TYPING INDICATORS
  // ======================================================
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

  // ======================================================
  // TOOGLE VISIBILITY
  // ======================================================
  socket.on("toggle_visibility", async (showOnlineStatus) => {
    try {
      const user = await User.findById(socket.user._id);
      if (!user) return;

      user.showOnlineStatus = showOnlineStatus;
      user.isOnline = showOnlineStatus ? true : false;
      user.lastSeen = new Date();
      await user.save();

      // Broadcast instantly to everyone
      io.emit("user_status_update", {
        userId: user._id,
        online: user.isOnline,
        showOnlineStatus: user.showOnlineStatus,
        lastSeen: user.lastSeen,
      });
    } catch (err) {
      console.error("toggle_visibility socket error:", err);
    }
  });

  // ======================================================
  // HIDE CONVERSATION
  // ======================================================
  socket.on("hide_conversation", async ({ conversationId }) => {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return;

    if (!conv.deletedFor.includes(userId)) {
      conv.deletedFor.push(userId);
      await conv.save();
    }

    // check if both users deleted
    if (conv.deletedFor.length === conv.participants.length) {
      await conv.deleteOne(); // 🧹 cascade delete
    }

    socket.emit("conversation_hidden", { conversationId });
  });

  // ======================================================
  // DISCONNECT → OFFLINE
  // ======================================================
  socket.on("disconnect", async () => {
    console.log(`❌ ${username} disconnected from chat`);
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();

        if (user.showOnlineStatus) {
          io.emit("user_offline", {
            userId,
            username,
            online: false,
            lastSeen: user.lastSeen,
          });
          console.log(`🔴 ${username} went offline`);
        } else {
          console.log(`🙈 ${username} hides offline status`);
        }
      }
    } catch (err) {
      console.error("Error updating offline status:", err);
    }
  });
}
