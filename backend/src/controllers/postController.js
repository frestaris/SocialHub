import Post from "../models/postSchema.js";

// @desc    Create a text post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, category, image } = req.body;

    const post = await Post.create({
      userId: req.user._id,
      type: "text",
      content,
      category,
      image: image || null,
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get all posts (optionally by category)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const posts = await Post.find(filter)
      .populate("userId", "username avatar")
      .populate("videoId", "title thumbnail url duration description")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username avatar")
      .populate("videoId", "title thumbnail url duration");

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ success: true, post });
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// later: add update, delete, like, comment handlers
