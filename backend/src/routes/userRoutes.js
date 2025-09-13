import express from "express";
import { getCurrentUser, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", getCurrentUser);
router.get("/:id", getUserById);

export default router;
