import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: { type: String, enum: ["text", "image", "video"], required: true },

    // shared
    content: { type: String },
    category: { type: String },
    images: [{ type: String, default: null }],
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // video-specific
    video: {
      title: { type: String },
      url: { type: String },
      thumbnail: { type: String },
      duration: { type: Number, default: 0 },
    },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
