import Comment from "../models/commentSchema.js";
import Post from "../models/postSchema.js";
import Notification from "../models/notificationSchema.js";
import { io } from "../../index.js";

/**
 * Create a new comment
 * -----------------------
 * - Requires `postId` and `content`.
 * - Saves comment → links it to the Post.
 * - Repopulates Post with comments + user details for UI sync.
 */
export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    // Validate input
    if (!content) {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, error: "postId is required" });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      userId: req.user._id,
      postId,
    });

    // Link comment ID to Post.comments
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    // Repopulate the Post with fresh data
    const updatedPost = await Post.findById(postId)
      .populate("userId", "username avatar")
      .populate({
        path: "comments",
        populate: [
          { path: "userId", select: "username avatar" },
          { path: "replies.userId", select: "username avatar" },
        ],
      });

    // Create & emit notification (if commenter is not post owner)
    if (updatedPost.userId._id.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        userId: updatedPost.userId._id, // recipient = post owner
        type: "comment",
        fromUser: req.user._id, // actor = commenter
        postId: updatedPost._id,
        commentId: comment._id,
      });

      // Populate sender info for UI
      const populatedNotif = await notif.populate(
        "fromUser",
        "username avatar"
      );

      // Emit via socket to post owner’s room
      io.to(updatedPost.userId._id.toString()).emit(
        "notification",
        populatedNotif
      );
    }

    // Return both new comment and updated post
    res.status(201).json({
      success: true,
      comment: await comment.populate("userId", "username avatar"),
      post: updatedPost,
    });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Get comments
 * ---------------
 * - If `postId` param is provided → returns comments for that post.
 * - Otherwise → returns all comments.
 * - Sorted newest → oldest.
 */
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const filter = postId ? { postId } : {};

    const comments = await Comment.find(filter)
      .populate("userId", "username avatar")
      .populate("replies.userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Update comment
 * -----------------
 * - Only the comment owner can edit.
 * - Marks comment as `edited = true` if content changes.
 * - Repopulates comment with user data before returning.
 */
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Find comment
    let comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    // Only owner can edit
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Update content if changed
    if (content && content !== comment.content) {
      comment.content = content;
      comment.edited = true;
    }

    const updatedComment = await comment.save();

    // Repopulate with user details
    const populated = await Comment.findById(updatedComment._id).populate(
      "userId",
      "username avatar"
    );

    res.json({ success: true, comment: populated });
  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Delete comment
 * -----------------
 * - Only the comment owner can delete.
 * - Also removes comment reference from the parent Post.
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    // Only owner can delete
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Remove reference from Post.comments
    if (comment.postId) {
      await Post.findByIdAndUpdate(comment.postId, {
        $pull: { comments: comment._id },
      });
    }

    await comment.deleteOne();

    res.json({ success: true, id });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Toggle like/unlike on a comment
export const toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the comment by id
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id.toString();

    // Ensure likes array exists
    if (!comment.likes) comment.likes = [];

    // 2. Check if the user already liked the comment
    if (comment.likes.some((u) => u.toString() === userId)) {
      // If yes → remove the like (unlike)
      comment.likes = comment.likes.filter((u) => u.toString() !== userId);
    } else {
      // If no → add the like
      comment.likes.push(userId);
    }

    // 3. Update likesCount for quick access
    comment.likesCount = comment.likes.length;

    // Save changes
    await comment.save();

    // 4. Re-fetch and populate user fields before sending response
    const populated = await Comment.findById(id)
      .populate("userId", "username avatar")
      .populate("replies.userId", "username avatar");

    // Return updated comment with user details
    res.json({ success: true, comment: populated });
  } catch (err) {
    console.error("toggleLikeComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
