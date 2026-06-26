const express = require("express");

const {
  register,
  login,
  googleLogin,
  getMe,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================
// AUTH ROUTES
// =====================

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/google-login
router.post("/google-login", googleLogin);

// GET /api/auth/me
router.get("/me", verifyToken, getMe);

module.exports = router;