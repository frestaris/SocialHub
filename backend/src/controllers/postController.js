import Post from "../models/postSchema.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { type, content, category, image, video } = req.body;

    if (type === "video") {
      if (!video || !video.url || !video.title || !content) {
        return res.status(400).json({
          success: false,
          error: "Video title, URL, and content are required",
        });
      }

      const newPost = await Post.create({
        userId: req.user._id,
        type: "video",
        category: video.category || category || "",
        content, // always use content as description
        video: {
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail || "",
          duration: video.duration || 0,
        },
      });

      const populated = await Post.findById(newPost._id).populate(
        "userId",
        "username avatar"
      );

      return res.status(201).json({ success: true, post: populated });
    }

    // ---- TEXT / IMAGE ----
    const newPost = await Post.create({
      userId: req.user._id,
      type, // 👈 trust frontend-provided type
      content,
      category,
      image: image || null,
    });

    const populated = await Post.findById(newPost._id).populate(
      "userId",
      "username avatar"
    );

    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET POSTS
export const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const posts = await Post.find(filter)
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET POST BY ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username avatar")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username avatar" },
      });

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ success: true, post });
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET USER POSTS
export const getPostsByUser = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };

    const posts = await Post.find({ userId: req.params.userId })
      .sort(sortOption)
      .populate("userId", "username avatar");
    res.json({ success: true, posts });
  } catch (err) {
    console.error("Get user posts error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// UPDATE POST
export const updatePost = async (req, res) => {
  try {
    const { content, category, image, video } = req.body;

    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Only owner can edit
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    let changed = false;

    // Update text fields
    if (content !== undefined && content !== post.content) {
      post.content = content;
      changed = true;
    }
    if (category !== undefined && category !== post.category) {
      post.category = category;
      changed = true;
    }

    // Update image
    if (image !== undefined && image !== post.image) {
      post.image = image;
      post.type = image ? "image" : "text";
      post.video = null;
      changed = true;
    }

    // Update video
    if (video) {
      post.type = "video";
      post.image = null;
      post.video = {
        title: video.title || post.video?.title,
        url: video.url || post.video?.url,
        thumbnail: video.thumbnail || post.video?.thumbnail,
        duration: video.duration || post.video?.duration,
      };
      if (video.category) post.category = video.category;

      // ensure content (description) updates
      if (content !== undefined) {
        post.content = content;
      }

      changed = true;
    }

    // ✅ mark as edited if anything changed
    if (changed) {
      post.edited = true;
    }

    const updatedPost = await post.save();

    const populated = await Post.findById(updatedPost._id).populate(
      "userId",
      "username avatar"
    );

    res.json({ success: true, post: populated });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Only owner can delete
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET USER FEED
export const getUserFeed = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = { createdAt: -1 }; // default = newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };
    if (sort === "liked") sortOption = { likes: -1 };

    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "username avatar")
      .sort(sortOption);

    res.json({ success: true, feed: posts });
  } catch (err) {
    console.error("Get user feed error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// INCREMENT POST VIEWS
export const incrementPostViews = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("userId", "username avatar");

    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    res.json({ success: true, views: post.views });
  } catch (err) {
    console.error("Increment views error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// TOGGLE LIKE POST
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    const userId = req.user._id.toString();

    if (post.likes.some((id) => id.toString() === userId)) {
      // ✅ Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // ✅ Like
      post.likes.push(userId);
    }

    await post.save();

    const updated = await Post.findById(post._id).populate(
      "userId",
      "username avatar"
    );

    res.json({ success: true, post: updated });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
