import mongoose from "mongoose";

const livestreamSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    isActive: { type: Boolean, default: false },

    streamKey: { type: String, required: true, unique: true },
    url: { type: String }, // RTMP/WebRTC playback URL

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

    startedAt: { type: Date },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: null }, // seconds
  },
  { timestamps: true }
);

export default mongoose.model("Livestream", livestreamSchema);
