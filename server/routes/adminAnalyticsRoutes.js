const express = require("express");

const { getAdminAnalytics } = require("../controllers/adminAnalyticsController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// ADMIN ANALYTICS ROUTE
// GET /api/admin/analytics
// ===============================
router.get("/", verifyToken, verifyAdmin, getAdminAnalytics);

module.exports = router;