import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db.js";
import { socketAuth } from "./src/middleware/socketAuth.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import replyRoutes from "./src/routes/replyRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import conversationRoutes from "./src/routes/conversationRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Connect to DB
connectDB();

// --- Setup server with Socket.IO ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(socketAuth);

app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/replies", replyRoutes);
app.use("/notifications", notificationRoutes);
app.use("/conversations", conversationRoutes);

// Handle socket connections
io.on("connection", (socket) => {
  import("./src/middleware/chatSocket.js").then(({ default: chatSocket }) => {
    chatSocket(io, socket);
  });

  socket.on("disconnect", () => {});
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { io };
