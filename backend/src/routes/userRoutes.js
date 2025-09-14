import express from "express";
import {
  deleteUser,
  getCurrentUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listUsers);
router.get("/:id", getUserById);
router.get("/me", protect, getCurrentUser);
router.put("/:me", protect, updateUser);
router.delete("/me", protect, deleteUser);

export default router;
