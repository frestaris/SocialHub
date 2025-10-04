import Conversation from "../models/converstationSchema.js";
import Message from "../models/messageSchema.js";

export default function chatSocket(io, socket) {
  const userId = socket.user?._id;

  socket.on("join_conversations", (conversationIds) => {
    conversationIds.forEach((cId) => socket.join(cId.toString()));
  });

  socket.on("send_message", async ({ conversationId, content }) => {
    const msg = await Message.create({
      conversationId,
      sender: userId,
      content,
      readBy: [userId],
    });

    // update conversation’s lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: msg._id,
    });

    const populated = await msg.populate("sender", "username avatar");
    io.to(conversationId.toString()).emit("new_message", populated);
  });

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

  socket.on("mark_as_read", async ({ conversationId }) => {
    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    io.to(conversationId.toString()).emit("seen", {
      conversationId,
      userId,
      seenAt: new Date(),
    });
  });
}
