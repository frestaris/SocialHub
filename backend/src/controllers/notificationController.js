import Notification from "../models/notificationSchema.js";

export const getNotifications = async (req, res) => {
  try {
    const { skip = 0, limit = 10 } = req.query;

    const notifications = await Notification.find({ userId: req.user._id })
      .populate("fromUser", "username avatar")
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Notification.countDocuments({ userId: req.user._id });
    const hasMore = skip + notifications.length < total;

    res.json({ success: true, notifications, hasMore, total });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
