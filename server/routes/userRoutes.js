const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  suspendUser,
  activateUser,
  deleteUser,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ==============================
// PROFILE ROUTES
// ==============================

// Get logged-in user profile
router.get("/me", verifyToken, getMyProfile);

// Update logged-in user profile
router.patch("/me", verifyToken, updateMyProfile);

// Keep this route also because your frontend may already use /profile
router.patch("/profile", verifyToken, updateMyProfile);

// ==============================
// ADMIN USER MANAGEMENT ROUTES
// ==============================

// Get all users
router.get("/", verifyToken, authorizeRoles("admin"), getAllUsers);

// Suspend user
router.patch("/:id/suspend", verifyToken, authorizeRoles("admin"), suspendUser);

// Activate user
router.patch("/:id/activate", verifyToken, authorizeRoles("admin"), activateUser);

// Delete user
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

module.exports = router;