import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    url: { type: String, required: true },
    thumbnail: { type: String },
    duration: { type: Number },
    views: { type: Number, default: 0 },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

export default mongoose.model("Video", videoSchema);
