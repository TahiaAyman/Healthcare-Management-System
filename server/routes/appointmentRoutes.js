const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getPatientDashboardSummary,
  getMyAppointments,
  cancelMyAppointment,
  rescheduleMyAppointment,
  deleteMyCancelledAppointment,
} = require("../controllers/appointmentController");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// PATIENT: BOOK APPOINTMENT
router.post("/", verifyToken, authorizeRoles("patient"), createAppointment);

// PATIENT: DASHBOARD SUMMARY
router.get(
  "/patient/summary",
  verifyToken,
  authorizeRoles("patient"),
  getPatientDashboardSummary
);

// PATIENT: MY APPOINTMENTS
router.get("/my", verifyToken, authorizeRoles("patient"), getMyAppointments);

// PATIENT: CANCEL APPOINTMENT
router.patch(
  "/my/:id/cancel",
  verifyToken,
  authorizeRoles("patient"),
  cancelMyAppointment
);

// PATIENT: RESCHEDULE APPOINTMENT
router.patch(
  "/my/:id/reschedule",
  verifyToken,
  authorizeRoles("patient"),
  rescheduleMyAppointment
);

// PATIENT: DELETE CANCELLED APPOINTMENT HISTORY
router.delete(
  "/my/:id",
  verifyToken,
  authorizeRoles("patient"),
  deleteMyCancelledAppointment
);

module.exports = router;