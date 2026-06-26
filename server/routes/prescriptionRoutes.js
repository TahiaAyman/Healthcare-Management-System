const express = require("express");

const {
  getMyPrescriptionByAppointment,
  getMyPrescriptions,
} = require("../controllers/prescriptionController");

const { verifyToken, verifyPatient } = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// PROTECT PATIENT PRESCRIPTION ROUTES
// ===============================
router.use(verifyToken);
router.use(verifyPatient);

// ===============================
// PATIENT PRESCRIPTION ROUTES
// GET /api/prescriptions/my
// GET /api/prescriptions/my/appointment/:appointmentId
// ===============================
router.get("/my", getMyPrescriptions);
router.get("/my/appointment/:appointmentId", getMyPrescriptionByAppointment);

module.exports = router;