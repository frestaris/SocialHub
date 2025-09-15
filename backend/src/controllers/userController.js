import User from "../models/userSchema.js";
import Video from "../models/videoSchema.js";
import Post from "../models/postSchema.js";
import Comment from "../models/commentSchema.js";
import { firebaseAdmin } from "../config/firebaseAdmin.js";

export const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const uid = decoded.uid;
    const email = decoded.email;

    // Look up by UID first, fallback to email
    let user = await User.findOne({
      $or: [{ "providers.providerId": uid }, { email: email }],
    });

    // Auto-create if missing (optional)
    if (!user) {
      user = await User.create({
        username: decoded.name || email.split("@")[0],
        email,
        avatar: decoded.picture || "",
        role: "fan",
        providers: [
          {
            provider: decoded.firebase?.sign_in_provider || "unknown",
            providerId: uid,
          },
        ],
      });
    }

    // Return only safe fields
    const { username, avatar, role, providers } = user;
    res.json({
      success: true,
      user: { username, email: user.email, avatar, role, providers },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "username email avatar bio role providers followers"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, avatar },
      { new: true }
    ).select("username email avatar bio role providers");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const userId = req.user._id;

    // Delete user-owned content from MongoDB
    await Promise.all([
      Video.deleteMany({ creatorId: userId }),
      Post.deleteMany({ userId }),
      Comment.deleteMany({ userId }),
    ]);

    // Get Firebase UID (prefer uid field, fallback to providers[0].providerId)
    const firebaseUid =
      req.user.uid || req.user.providers?.[0]?.providerId || null;

    // Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    // Delete user from Firebase if UID exists
    if (firebaseUid) {
      await firebaseAdmin.auth().deleteUser(firebaseUid);
    }

    res.json({
      success: true,
      message: "User deleted from MongoDB and Firebase",
    });
  } catch (err) {
    console.error("Delete user error:", err.message, err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "username email avatar bio role followers"
    );
    res.json({ success: true, users });
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
