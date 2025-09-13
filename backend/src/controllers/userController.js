import User from "../models/userSchema.js";
import { firebaseAdmin } from "../config/firebaseAdmin.js";

export const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const uid = decoded.uid;
    const email = decoded.email;

    // Look up by UID first, fallback to email
    let user = await User.findOne({
      $or: [{ "providers.providerId": uid }, { email: email }],
    });

    // Auto-create if missing (optional)
    if (!user) {
      user = await User.create({
        username: decoded.name || email.split("@")[0],
        email,
        avatar: decoded.picture || "",
        role: "fan",
        providers: [
          {
            provider: decoded.firebase?.sign_in_provider || "unknown",
            providerId: uid,
          },
        ],
      });
    }

    // Return only safe fields
    const { username, avatar, role, providers } = user;
    res.json({
      success: true,
      user: { username, email: user.email, avatar, role, providers },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
