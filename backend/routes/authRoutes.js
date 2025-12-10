
// connection fix
// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  registerAdmin,
  registerStudent,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateMyProfile
} = require("../controllers/authController");

// Registration
router.post("/register-admin", registerAdmin);
router.post("/register-student", registerStudent);

// Auth
router.post("/verify", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile (for students to update semester)
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

module.exports = router;