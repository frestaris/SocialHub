import Comment from "../models/commentSchema.js";
import Post from "../models/postSchema.js";

export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    // 1. Create comment
    const comment = await Comment.create({
      userId: req.user._id,
      postId: postId || null,
      content,
    });

    // 2. Link it to Post or Video
    if (postId) {
      await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment._id },
      });
    }

    // 3. Repopulate the Post (with comments + user details)
    let updatedPost = null;
    if (postId) {
      updatedPost = await Post.findById(postId)
        .populate("userId", "username avatar")
        .populate("videoId", "title thumbnail url description duration")
        .populate({
          path: "comments",
          populate: { path: "userId", select: "username avatar" },
        });
    }

    res.status(201).json({
      success: true,
      comment: await comment.populate("userId", "username avatar"),
      post: updatedPost, // return the fresh post if you want UI sync
    });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET COMMENTS (by post or video)
export const getComments = async (req, res) => {
  try {
    const { postId, videoId } = req.params;
    const filter = postId ? { postId } : { videoId };

    const comments = await Comment.find(filter)
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

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
    if (content && content !== comment.content) {
      comment.content = content;
      comment.edited = true;
    }

    if (content) comment.content = content;
    const updatedComment = await comment.save();

    // Repopulate with user
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

//  Delete Comment
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

    // Remove from Post.comments
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
