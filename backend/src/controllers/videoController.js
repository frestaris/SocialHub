import Video from "../models/videoSchema.js";

// GET VIDEO BY ID
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

// INCREMENT VIEW
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

// LIKE VIDEO
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

// UNLIKE VIDEO
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
