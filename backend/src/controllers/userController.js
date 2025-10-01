import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";
import Comment from "../models/commentSchema.js";
import Notification from "../models/notificationSchema.js";
import { io } from "../../index.js";
import { firebaseAdmin } from "../config/firebaseAdmin.js";

/**
 * Get Current User
 * -------------------
 * - Verifies Firebase token from Authorization header.
 * - Finds user in Mongo (by providerId or email).
 * - Auto-creates user if not found (default role = fan).
 * - Returns safe fields only (no password).
 */
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

    // Look up by Firebase UID first, fallback to email
    let user = await User.findOne({
      $or: [{ "providers.providerId": uid }, { email }],
    });

    // Auto-create if missing
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

    // Return safe fields only
    const { username, avatar, role, providers, cover, coverOffset } = user;
    res.json({
      success: true,
      user: {
        username,
        email: user.email,
        avatar,
        cover,
        coverOffset,
        role,
        providers,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get User By ID
 * -----------------
 * - Finds user by MongoDB ID.
 * - Populates followers and following.
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select(
        "username email avatar cover coverOffset bio role providers followers following"
      )
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update User Profile
 * ----------------------
 * - Updates username, bio, avatar, or cover.
 * - Returns populated user with followers/following.
 */
export const updateUser = async (req, res) => {
  try {
    const { username, bio, avatar, cover, coverOffset } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, avatar, cover, coverOffset },
      { new: true }
    )
      .populate("followers", "username avatar")
      .populate("following", "username avatar")
      .select(
        "username email avatar cover coverOffset  bio role providers followers following"
      );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete User
 * --------------
 * - Only the logged-in user can delete their account.
 * - Deletes user’s posts and comments.
 * - Deletes user record in Mongo.
 * - Deletes user in Firebase (if UID is available).
 */
export const deleteUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const userId = req.user._id;

    // Delete related content
    await Promise.all([
      Post.deleteMany({ userId }),
      Comment.deleteMany({ userId }),
    ]);

    // Get Firebase UID (prefer uid field, fallback to providers)
    const firebaseUid =
      req.user.uid || req.user.providers?.[0]?.providerId || null;

    // Delete Mongo user
    await User.findByIdAndDelete(userId);

    // Delete Firebase user if UID exists
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

/**
 * List Users (Top Creators)
 * ----------------------------
 * - Fetches all users with followers/following.
 * - Calculates `followersCount`.
 * - Sorts by followers (descending).
 * - Returns top 10 users only.
 */
export const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "username email avatar cover coverOffset bio role followers following"
      )
      .populate("followers", "username avatar")
      .populate("following", "username avatar")
      .lean();

    const sorted = users
      .map((u) => ({
        ...u,
        followersCount: u.followers?.length || 0,
      }))
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, 10);

    res.json({ success: true, users: sorted });
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Toggle Follow
 * ----------------
 * - Current user follows/unfollows a target user.
 * - Uses atomic MongoDB updates ($addToSet / $pull).
 * - Returns updated target + current user.
 */
export const toggleFollow = async (req, res) => {
  try {
    const { id } = req.params; // Target user
    const currentUserId = req.user._id;

    if (id === currentUserId.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = targetUser.followers.some(
      (f) => f.toString() === currentUserId.toString()
    );

    if (isFollowing) {
      // Unfollow
      await Promise.all([
        User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } }),
        User.findByIdAndUpdate(currentUserId, { $pull: { following: id } }),
      ]);
    } else {
      // Follow
      await Promise.all([
        User.findByIdAndUpdate(id, { $addToSet: { followers: currentUserId } }),
        User.findByIdAndUpdate(currentUserId, { $addToSet: { following: id } }),
      ]);

      // Create & emit notification
      if (id.toString() !== currentUserId.toString()) {
        const notif = await Notification.create({
          userId: id, // recipient = the one being followed
          type: "follow",
          fromUser: currentUserId, // actor = follower
        });

        const populatedNotif = await notif.populate(
          "fromUser",
          "username avatar"
        );
        io.to(id.toString()).emit("notification", populatedNotif);
      }
    }

    // Re-fetch both users with followers/following populated
    const updatedTarget = await User.findById(id)
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    const updatedCurrent = await User.findById(currentUserId)
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    res.json({
      success: true,
      isFollowing: !isFollowing, // new state after toggle
      targetUser: updatedTarget,
      currentUser: updatedCurrent,
    });
  } catch (err) {
    console.error("Toggle follow error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
