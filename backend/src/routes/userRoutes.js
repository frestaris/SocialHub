import express from "express";
import {
  deleteUser,
  getCurrentUser,
  getUserById,
  listUsers,
  toggleFollow,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated routes (current user)
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);

// Public routes
router.get("/", listUsers);
router.get("/:id", getUserById);

// Authenticated routes (interactions)
router.patch("/:id/follow", protect, toggleFollow);

export default router;
