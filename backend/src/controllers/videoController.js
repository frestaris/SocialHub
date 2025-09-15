import Video from "../models/videoSchema.js";

// @desc    Create a new video
// @route   POST /api/videos
// @access  Private (creator only)
export const createVideo = async (req, res) => {
  try {
    const { title, description, category, url, thumbnail, duration } = req.body;

    const video = await Video.create({
      creatorId: req.user._id,
      title,
      description,
      category,
      url,
      thumbnail,
      duration,
    });

    res.status(201).json({ success: true, video });
  } catch (err) {
    console.error("Create video error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get a single video by ID
// @route   GET /api/videos/:id
// @access  Public
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("creatorId", "username avatar")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username avatar" },
      });

    if (!video)
      return res.status(404).json({ success: false, error: "Video not found" });

    res.json({ success: true, video });
  } catch (err) {
    console.error("Get video error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get all videos (optionally filter by category)
// @route   GET /api/videos
// @access  Public
export const getAllVideos = async (req, res) => {
  try {
    const { category, sort } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };

    const videos = await Video.find(query)
      .populate("creatorId", "username avatar")
      .sort(sortOption);

    res.json({ success: true, videos });
  } catch (err) {
    console.error("Get all videos error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Get all videos for a user (with sorting)
// @route   GET /api/videos/user/:userId?sort=newest|oldest|popular
// @access  Public
export const getVideosByUser = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { views: -1 };

    const videos = await Video.find({ creatorId: req.params.userId })
      .sort(sortOption)
      .populate("creatorId", "username avatar");

    res.json({ success: true, videos });
  } catch (err) {
    console.error("Get user videos error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:id
// @access  Private (owner only)
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video)
      return res.status(404).json({ success: false, error: "Video not found" });
    if (video.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const updates = req.body;
    Object.assign(video, updates);

    await video.save();
    res.json({ success: true, video });
  } catch (err) {
    console.error("Update video error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private (owner only)
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video)
      return res.status(404).json({ success: false, error: "Video not found" });
    if (video.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    await video.deleteOne();
    res.json({ success: true, message: "Video deleted" });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Increment video views
// @route   PATCH /api/videos/:id/view
// @access  Public
export const incrementView = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video)
      return res.status(404).json({ success: false, error: "Video not found" });

    video.views += 1;
    await video.save();

    res.json({ success: true, views: video.views });
  } catch (err) {
    console.error("Increment view error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Like a video
// @route   PATCH /api/videos/:id/like
// @access  Private
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video)
      return res.status(404).json({ success: false, error: "Video not found" });

    if (!video.likes.includes(req.user._id)) {
      video.likes.push(req.user._id);
      await video.save();
    }

    res.json({ success: true, likes: video.likes.length });
  } catch (err) {
    console.error("Like video error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// @desc    Unlike a video
// @route   PATCH /api/videos/:id/unlike
// @access  Private
export const unlikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video)
      return res.status(404).json({ success: false, error: "Video not found" });

    video.likes = video.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await video.save();

    res.json({ success: true, likes: video.likes.length });
  } catch (err) {
    console.error("Unlike video error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
