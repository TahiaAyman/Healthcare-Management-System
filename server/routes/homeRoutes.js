const express = require("express");

const { getHomeData } = require("../controllers/homeController");

const router = express.Router();

// ===============================
// PUBLIC HOME DATA ROUTE
// GET /api/home
// ===============================
router.get("/", getHomeData);

module.exports = router;