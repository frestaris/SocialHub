import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, immutable: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cover: { type: String },
    coverOffsetPercent: { type: Number, default: 0 },
    avatar: { type: String },
    role: { type: String, enum: ["creator", "fan"], default: "fan" },
    bio: { type: String },

    providers: [
      {
        provider: { type: String },
        providerId: { type: String },
      },
    ],

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// 🔑 Capitalize only the first letter of the username
userSchema.pre("save", function (next) {
  if (this.username) {
    this.username =
      this.username.charAt(0).toUpperCase() + this.username.slice(1);
  }
  next();
});

export default mongoose.model("User", userSchema);
