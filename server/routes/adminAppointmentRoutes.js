const express = require("express");

const {
  getAllAppointmentsForAdmin,
} = require("../controllers/adminAppointmentController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ADMIN ONLY
router.get("/", verifyToken, verifyAdmin, getAllAppointmentsForAdmin);

module.exports = router;