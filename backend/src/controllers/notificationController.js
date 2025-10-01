import Notification from "../models/notificationSchema.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("fromUser", "username avatar")
      .populate("postId", "content")
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch {
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
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
};
