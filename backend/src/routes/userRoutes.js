import express from "express";
import {
  deleteUser,
  followUser,
  getCurrentUser,
  getUserById,
  listUsers,
  unfollowUser,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listUsers);
router.get("/:id", getUserById);
router.get("/me", protect, getCurrentUser);
router.put("/:me", protect, updateUser);
router.delete("/me", protect, deleteUser);

router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

export default router;
