import { firebaseAdmin } from "../config/firebaseAdmin.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Handle Firebase login/signup
export const firebaseLogin = async (req, res) => {
  try {
    const { token, role } = req.body;

    // Verify Firebase token
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    const email = decoded.email;
    const provider =
      decoded.firebase.sign_in_provider?.replace(".com", "") || "google";
    const providerId = decoded.uid;

    let user = await User.findOne({ email });

    if (user) {
      // ✅ If user already exists but has no provider info, link it
      if (!user.provider || !user.providerId) {
        user.provider = provider;
        user.providerId = providerId;
        await user.save();
      }
    } else {
      // ✅ Create new user
      user = await User.create({
        username: decoded.name || email.split("@")[0],
        email,
        avatar: decoded.picture || "",
        role: role || "fan",
        provider,
        providerId,
        passwordHash: null, // social login doesn’t need a password
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      providers: [], // empty, since not social
    });

    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
