import mongoose from "mongoose";
import Message from "./messageSchema.js";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    status: {
      type: String,
      enum: ["one_way", "mutual"],
      default: "one_way",
    },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

// Cascade delete messages when a conversation is deleted
conversationSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      console.log(`🧹 Cascade deleting messages for conversation ${this._id}`);
      await Message.deleteMany({ conversationId: this._id });
      next();
    } catch (err) {
      console.error("Cascade delete error in Conversation model:", err);
      next(err);
    }
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
