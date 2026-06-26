const express = require("express");
const router = express.Router();

const { getAdminStats } = require("../controllers/adminController");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ADMIN DASHBOARD REAL STATS
router.get("/stats", verifyToken, authorizeRoles("admin"), getAdminStats);

module.exports = router;