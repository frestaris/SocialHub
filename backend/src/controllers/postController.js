import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";
import Notification from "../models/notificationSchema.js";
import { io } from "../../index.js";

/**
 * CREATE POST
 * --------------
 * - Handles both video posts and text/image posts.
 * - For videos → requires title, url, and content (description).
 * - Returns the newly created post populated with user info.
 */
export const createPost = async (req, res) => {
  try {
    const { type, content, category, images, video } = req.body;

    // Prevent mixing YouTube + images
    if (video && images && images.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot mix YouTube and image URLs in one post",
      });
    }

    let newPost;

    if (type === "video") {
      // Validate video fields
      if (!video || !video.url || !video.title || !content) {
        return res.status(400).json({
          success: false,
          error: "Video title, URL, and content are required",
        });
      }

      newPost = await Post.create({
        userId: req.user._id,
        type: "video",
        category: video.category || category || "",
        content,
        video: {
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail || "",
          duration: video.duration || 0,
        },
      });
    } else {
      // Text or Image post
      newPost = await Post.create({
        userId: req.user._id,
        type,
        content,
        category,
        images: images && Array.isArray(images) ? images : [],
      });
    }

    // Fetch author with followers
    const author = await User.findById(req.user._id).select(
      "followers username avatar"
    );

    const populated = await Post.findById(newPost._id).populate(
      "userId",
      "username avatar"
    );

    // Notify followers
    if (author.followers?.length > 0) {
      for (const followerId of author.followers) {
        const notif = await Notification.create({
          userId: followerId, // recipient = follower
          type: "new_post",
          fromUser: req.user._id, // actor = post owner
          postId: newPost._id,
        });

        const populatedNotif = await notif.populate(
          "fromUser",
          "username avatar"
        );
        io.to(followerId.toString()).emit("notification", populatedNotif);
      }
    }

    return res.status(201).json({ success: true, post: populated });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * GET POSTS
 * -----------------------------------
 * - Supports filters: category, search_query.
 * - Supports sorts: newest, views, likes, trending.
 * - Trending uses aggregation (score = views + likes*2).
 * - Returns paginated results (skip + limit).
 */
export const getPosts = async (req, res) => {
  try {
    const {
      category,
      search_query,
      limit = 20,
      skip = 0,
      sort = "newest",
    } = req.query;

    const filter = { hidden: { $ne: true } };

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Search across content, category, video title, and username
    if (search_query) {
      const users = await User.find({
        username: { $regex: search_query, $options: "i" },
      }).select("_id");

      const userIds = users.map((u) => u._id);

      filter.$or = [
        { content: { $regex: search_query, $options: "i" } },
        { category: { $regex: search_query, $options: "i" } },
        { "video.title": { $regex: search_query, $options: "i" } },
        { userId: { $in: userIds } },
        { images: { $elemMatch: { $regex: search_query, $options: "i" } } }, // ✅ search inside images array
      ];
    }

    const limitNum = Number(limit) || 20;
    const skipNum = Number(skip) || 0;

    // Trending → aggregation pipeline
    if (sort === "trending") {
      const posts = await Post.aggregate([
        { $match: filter },
        {
          $addFields: {
            score: { $add: ["$views", { $multiply: ["$likesCount", 2] }] },
          },
        },
        { $sort: { score: -1 } },
        { $skip: skipNum },
        { $limit: limitNum },
      ]);

      // Populate userId after aggregation
      const populated = await Post.populate(posts, {
        path: "userId",
        select: "username avatar",
      });

      return res.json({
        success: true,
        posts: populated,
        total: populated.length, // counts only returned docs
      });
    }

    // Normal find (newest, views, likes)
    let sortOption = { createdAt: -1 };
    if (sort === "views") sortOption = { views: -1 };
    if (sort === "likes") sortOption = { likesCount: -1 };

    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate("userId", "username avatar")
      .populate({
        path: "comments",
        populate: [
          { path: "userId", select: "username avatar" },
          { path: "replies.userId", select: "username avatar" },
        ],
      })
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    res.json({ success: true, posts, total });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * GET POST BY ID
 * -----------------
 * - Populates user and all comments (with user info).
 */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username avatar")
      .populate({
        path: "comments",
        populate: [
          { path: "userId", select: "username avatar" },
          { path: "replies.userId", select: "username avatar" },
        ],
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.hidden) {
      const isOwner =
        req.user && post.userId._id.toString() === req.user._id.toString();
      if (!isOwner)
        return res
          .status(404)
          .json({ message: "Post not found or has been hidden" });
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Error fetching post by id:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET POSTS BY USER
 * --------------------
 * - Fetches all posts from a given user.
 * - Supports sorting (newest, oldest, popular).
 */
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

/**
 * UPDATE POST
 * ---------------
 * - Only the owner can edit.
 * - Updates content, category, image, or video.
 * - Marks post as `edited = true` if any changes were made.
 */
export const updatePost = async (req, res) => {
  try {
    const { content, category, images, video } = req.body;

    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Only owner can edit
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    let changed = false;

    // Text fields
    if (content !== undefined && content !== post.content) {
      post.content = content;
      changed = true;
    }
    if (category !== undefined && category !== post.category) {
      post.category = category;
      changed = true;
    }

    // Images (array)
    if (images !== undefined) {
      if (JSON.stringify(images) !== JSON.stringify(post.images)) {
        post.images = Array.isArray(images) ? images : [];
        post.type = post.images.length > 0 ? "image" : "text";
        post.video = null;
        changed = true;
      }
    }

    // Video
    if (video) {
      post.type = "video";
      post.images = [];
      post.video = {
        title: video.title || post.video?.title,
        url: video.url || post.video?.url,
        thumbnail: video.thumbnail || post.video?.thumbnail,
        duration: video.duration || post.video?.duration,
      };
      if (video.category) post.category = video.category;

      if (content !== undefined) {
        post.content = content;
      }

      changed = true;
    }

    // Mark as edited
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

/**
 * DELETE POST
 * --------------
 * - Only the owner can delete.
 */
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

/**
 * GET USER FEED
 * ----------------
 * - Returns posts from one user (for profile pages).
 * - Supports sorting (newest, oldest, popular, liked).
 */
export const getUserFeed = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };
    if (sort === "liked") sortOption = { likesCount: -1 };

    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "username avatar")
      .populate({
        path: "comments",
        populate: [
          { path: "userId", select: "username avatar" },
          { path: "replies.userId", select: "username avatar" },
        ],
      })
      .sort(sortOption);

    res.json({ success: true, feed: posts });
  } catch (err) {
    console.error("Get user feed error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * INCREMENT POST VIEWS
 * -----------------------
 * - Adds +1 to post.views.
 */
const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];

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

    // Check milestone
    if (MILESTONES.includes(post.views)) {
      const notif = await Notification.create({
        userId: post.userId._id,
        type: "view_milestone",
        fromUser: null,
        postId: post._id,
        value: post.views,
      });
      io.to(post.userId._id.toString()).emit("notification", notif);
    }

    res.json({ success: true, views: post.views });
  } catch (err) {
    console.error("Increment views error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * TOGGLE LIKE POST
 * -------------------
 * - Adds/removes the user’s ID from post.likes.
 * - Updates likesCount for faster queries.
 */
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username avatar"
    );
    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });

    const userId = req.user._id.toString();
    let liked = false;

    if (post.likes.some((id) => id.toString() === userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
      liked = true;
    }
    post.likesCount = post.likes.length;
    await post.save();

    if (liked && post.userId._id.toString() !== userId) {
      const notif = await Notification.create({
        userId: post.userId._id,
        type: "like",
        fromUser: req.user._id,
        postId: post._id,
      });
      const populatedNotif = await notif.populate(
        "fromUser",
        "username avatar"
      );
      io.to(post.userId._id.toString()).emit("notification", populatedNotif);
    }

    // ✅ return fully populated post
    const populated = await Post.findById(post._id)
      .populate("userId", "username avatar")
      .populate({
        path: "comments",
        populate: [
          { path: "userId", select: "username avatar" },
          { path: "replies.userId", select: "username avatar" },
        ],
      });

    res.json({ success: true, post: populated });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * TOGGLE HIDE POST
 * -------------------
 * - Hides the user post.
 */
export const toggleHidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Only owner can hide
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    post.hidden = !post.hidden;
    await post.save();

    const updated = await Post.findById(post._id).populate(
      "userId",
      "username avatar"
    );

    res.json({ success: true, post: updated });
  } catch (err) {
    console.error("Toggle hide error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
