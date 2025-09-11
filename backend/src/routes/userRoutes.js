import express from "express";
import {
  firebaseLogin,
  registerUser,
  loginUser,
} from "../controllers/userController.js";

const router = express.Router();

// Firebase login route
router.post("/firebase-login", firebaseLogin);

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
