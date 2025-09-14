import { firebaseAdmin } from "../config/firebaseAdmin.js";
import User from "../models/userSchema.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    // 🔑 Look up by Firebase UID instead of email
    let user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        username: decoded.name || decoded.email.split("@")[0],
        email: decoded.email,
        avatar: decoded.picture || "",
        role: "fan",
        providers: [
          {
            provider: decoded.firebase?.sign_in_provider || "unknown",
            providerId: decoded.uid,
          },
        ],
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Not authorized" });
  }
};
