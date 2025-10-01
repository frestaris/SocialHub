import Comment from "../models/commentSchema.js";
import Notification from "../models/notificationSchema.js";
import { io } from "../../index.js";

/**
 * Create a reply (level-1 only)
 * ------------------------------
 * - Requires `commentId` and `content`.
 * - Pushes reply into the parent comment's replies array.
 */
export const createReply = async (req, res) => {
  try {
    const { commentId, content } = req.body;
    if (!commentId || !content) {
      return res
        .status(400)
        .json({ success: false, error: "commentId and content are required" });
    }

    const comment = await Comment.findById(commentId).populate({
      path: "postId",
      populate: { path: "userId", select: "_id username avatar" },
    });
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Parent comment not found" });
    }

    // Add reply
    comment.replies.push({ userId: req.user._id, content });
    await comment.save();

    const populated = await Comment.findById(commentId).populate(
      "replies.userId",
      "username avatar"
    );

    // Notify comment owner
    if (comment.userId.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        userId: comment.userId,
        type: "reply",
        fromUser: req.user._id,
        postId: comment.postId._id,
        commentId: comment._id,
      });

      const populatedNotif = await notif.populate(
        "fromUser",
        "username avatar"
      );
      io.to(comment.userId.toString()).emit("notification", populatedNotif);
    }

    // Notify post owner (if not same as replier & not same as comment owner)
    if (
      comment.postId.userId._id.toString() !== req.user._id.toString() &&
      comment.postId.userId._id.toString() !== comment.userId.toString()
    ) {
      const notif = await Notification.create({
        userId: comment.postId.userId._id,
        type: "reply_on_post",
        fromUser: req.user._id,
        postId: comment.postId._id,
        commentId: comment._id,
      });

      const populatedNotif = await notif.populate(
        "fromUser",
        "username avatar"
      );
      io.to(comment.postId.userId._id.toString()).emit(
        "notification",
        populatedNotif
      );
    }

    res.status(201).json({
      success: true,
      replies: populated.replies,
    });
  } catch (err) {
    console.error("Create reply error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Update a reply
 * ------------------------------
 * - Requires `commentId` and `replyId`.
 * - Only reply owner can edit.
 */
export const updateReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: "Reply not found" });
    }

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    reply.content = content || reply.content;
    reply.edited = true;

    await comment.save();

    const populated = await Comment.findById(commentId).populate(
      "replies.userId",
      "username avatar"
    );

    res.json({ success: true, replies: populated.replies });
  } catch (err) {
    console.error("Update reply error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * Delete a reply
 * ------------------------------
 * - Requires `commentId` and `replyId`.
 * - Only reply owner can delete.
 */
export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, error: "Reply not found" });
    }

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    reply.deleteOne();
    await comment.save();

    res.json({ success: true, replyId });
  } catch (err) {
    console.error("Delete reply error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
