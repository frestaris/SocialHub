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
// before that, being that now video has been unified, can we remove the description and have only the content? around the full app now please?
