import { firebaseAdmin } from "../config/firebaseAdmin.js";
import User from "../models/userSchema.js";

// Verify Firebase token, sync user in Mongo
export const firebaseLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const email = decoded.email;
    const provider = decoded.firebase?.sign_in_provider || "unknown";
    const providerId = decoded.uid;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.providers) user.providers = [];
      const alreadyLinked = user.providers.some(
        (p) => p.provider === provider && p.providerId === providerId
      );
      if (!alreadyLinked) {
        user.providers.push({ provider, providerId });
        await user.save();
      }
    } else {
      user = await User.create({
        username: decoded.name || email.split("@")[0],
        email,
        avatar: decoded.picture || "",
        role: role || "fan",
        providers: [{ provider, providerId }],
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
