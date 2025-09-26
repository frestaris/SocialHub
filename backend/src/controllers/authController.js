import { firebaseAdmin } from "../config/firebaseAdmin.js";
import User from "../models/userSchema.js";

/**
 * Firebase Login
 * -----------------
 * - Verifies a Firebase ID token sent from the frontend.
 * - If the user already exists in Mongo → update their linked providers.
 * - If not → create a new user in Mongo with Firebase data.
 * - Finally → return the user object (with followers/following populated).
 */
export const firebaseLogin = async (req, res) => {
  try {
    // Extract token + optional role/username override from client
    const { token, role, username } = req.body;

    // 1️⃣ Verify token with Firebase Admin SDK
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    // 2️⃣ Extract core identity info from decoded token
    const email = decoded.email;
    const provider = decoded.firebase?.sign_in_provider || "unknown";
    const firebaseUid = decoded.uid;

    // 3️⃣ Look for existing Mongo user by Firebase UID
    let user = await User.findOne({ uid: firebaseUid });

    if (user) {
      // Ensure providers array exists
      if (!user.providers) user.providers = [];

      // Check if provider already linked
      const alreadyLinked = user.providers.some(
        (p) => p.provider === provider && p.providerId === firebaseUid
      );

      // If not linked, add this provider
      if (!alreadyLinked) {
        user.providers.push({ provider, providerId: firebaseUid });
        await user.save();
      }
    } else {
      // 4️⃣ No user? → create a new Mongo user
      user = await User.create({
        uid: firebaseUid,
        username: username || decoded.name || email.split("@")[0],
        email,
        avatar: decoded.picture || "",
        role: role || "fan", // default role = fan
        providers: [{ provider, providerId: firebaseUid }],
        followers: [],
        following: [],
      });
    }

    // 5️⃣ Re-fetch user with followers/following populated
    user = await User.findById(user._id)
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    // ✅ Return clean user object to client
    res.json({ success: true, user });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
