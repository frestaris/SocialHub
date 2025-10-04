import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
