import { firebaseAdmin } from "../config/firebaseAdmin.js";
import User from "../models/userSchema.js";

/**
 * Socket.IO authentication middleware
 * -------------------------------------
 * - Runs before a socket connection is established.
 * - Verifies the Firebase ID token sent by the client.
 * - Looks up the corresponding MongoDB user.
 * - Attaches the user to the socket and joins them to a private room.
 */
export async function socketAuth(socket, next) {
  try {
    // 1️⃣ Get the token that the client passed during the handshake
    // (frontend: io({ auth: { token } }))
    const token = socket.handshake.auth?.token;

    if (!token) {
      // If no token → block connection
      return next(new Error("No token provided"));
    }

    // 2️⃣ Verify the Firebase token using the Admin SDK
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    // 3️⃣ Find the Mongo user that matches the Firebase UID
    const mongoUser = await User.findOne({ uid: decoded.uid });

    if (!mongoUser) {
      // If no Mongo user is found → block connection
      return next(new Error("No Mongo user found"));
    }

    // 4️⃣ Attach the user object to the socket for later use
    socket.user = mongoUser;

    // 5️⃣ Join a private room named after the user’s Mongo _id
    // Controllers can then emit notifications with io.to(userId).emit(...)
    socket.join(mongoUser._id.toString());

    // 6️⃣ Allow the connection to continue
    next();
  } catch (err) {
    // Any error during token verification or lookup → block connection
    console.error("❌ Socket auth error:", err);
    next(new Error("Unauthorized"));
  }
}
