import Post from "../models/postSchema.js";
import Video from "../models/videoSchema.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { type, content, category, image, video } = req.body;

    let newPost;

    if (type === "video") {
      if (!video || !video.url || !video.title) {
        return res
          .status(400)
          .json({ success: false, error: "Video data is required" });
      }

      // Create the video document
      const newVideo = await Video.create({
        creatorId: req.user._id,
        title: video.title,
        description: video.description || "",
        category: video.category || category || "",
        url: video.url,
        thumbnail: video.thumbnail || "",
        duration: video.duration || 0,
      });

      // Create the post referencing the video
      newPost = await Post.create({
        userId: req.user._id,
        type: "video",
        videoId: newVideo._id,
        category: newVideo.category,
      });
    } else {
      // Create a text/image post
      newPost = await Post.create({
        userId: req.user._id,
        type: "text",
        content,
        category,
        image: image || null,
      });
    }

    // Populate before returning
    const populatedPost = await Post.findById(newPost._id)
      .populate("userId", "username avatar")
      .populate("videoId", "title thumbnail url duration description");

    res.status(201).json({ success: true, post: populatedPost });
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
      .populate("videoId", "title thumbnail url duration description")
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
      .populate("videoId")
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
      .populate("userId", "username avatar")
      .populate("videoId", "title thumbnail url duration");

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

    //  Only owner can edit
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Update text fields
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;

    // Update image
    if (image !== undefined) {
      post.image = image;
      post.videoId = null;
      post.type = "text";
    }

    // Update video (if provided)
    if (video) {
      let linkedVideo = await Video.findById(post.videoId);
      if (!linkedVideo) {
        linkedVideo = await Video.create({
          creatorId: req.user._id,
          title: video.title,
          description: video.description,
          category: video.category || category || "",
          url: video.url,
          thumbnail: video.thumbnail || "",
          duration: video.duration || 0,
        });
        post.videoId = linkedVideo._id;
      } else {
        if (video.title !== undefined) linkedVideo.title = video.title;
        if (video.description !== undefined)
          linkedVideo.description = video.description;
        if (video.category !== undefined) {
          linkedVideo.category = video.category;
          post.category = video.category;
        }
        if (video.url !== undefined) linkedVideo.url = video.url;
        if (video.thumbnail !== undefined)
          linkedVideo.thumbnail = video.thumbnail;
        if (video.duration !== undefined) linkedVideo.duration = video.duration;
        await linkedVideo.save();
      }
      post.type = "video";
      post.image = null;
    }

    const updatedPost = await post.save();

    const populated = await Post.findById(updatedPost._id)
      .populate("userId", "username avatar")
      .populate("videoId", "title thumbnail url duration description");

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

    // If post is linked to a video, delete the video
    if (post.type === "video" && post.videoId) {
      await Video.findByIdAndDelete(post.videoId);
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
    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };

    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "username avatar")
      .populate("videoId", "title description category url thumbnail duration")
      .sort(sortOption);

    // Add explicit type field
    const normalized = posts.map((p) => ({
      ...p.toObject(),
      type: p.type || (p.videoId ? "video" : "text"),
    }));

    res.json({ success: true, feed: normalized });
  } catch (err) {
    console.error("Get user feed error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
