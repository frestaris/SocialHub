import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
