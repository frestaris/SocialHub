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

router.get("/", listUsers);
router.get("/:id", getUserById);
router.get("/me", protect, getCurrentUser);
router.put("/:me", protect, updateUser);
router.delete("/me", protect, deleteUser);

router.patch("/:id/follow", protect, toggleFollow);

export default router;
