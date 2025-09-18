import Comment from "../models/commentSchema.js";
import Post from "../models/postSchema.js";
import Video from "../models/videoSchema.js";

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
