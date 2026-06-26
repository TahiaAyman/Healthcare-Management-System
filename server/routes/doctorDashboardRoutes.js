const express = require("express");

const {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorDashboardStats,

  getDoctorSchedules,
  addDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,

  getDoctorAppointments,
  updateAppointmentStatusByDoctor,

  getDoctorPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
} = require("../controllers/doctorDashboardController");

const {
  verifyToken,
  verifyDoctor,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================
// PROTECT ALL DOCTOR ROUTES
// =====================
router.use(verifyToken);
router.use(verifyDoctor);

// =====================
// DOCTOR DASHBOARD STATS
// GET /api/doctor/stats
// =====================
router.get("/stats", getDoctorDashboardStats);

// =====================
// DOCTOR PROFILE
// GET /api/doctor/profile
// PATCH /api/doctor/profile
// =====================
router.get("/profile", getDoctorProfile);
router.patch("/profile", updateDoctorProfile);

// =====================
// DOCTOR SCHEDULE CRUD
// GET /api/doctor/schedules
// POST /api/doctor/schedules
// PATCH /api/doctor/schedules/:scheduleId
// DELETE /api/doctor/schedules/:scheduleId
// =====================
router.get("/schedules", getDoctorSchedules);
router.post("/schedules", addDoctorSchedule);
router.patch("/schedules/:scheduleId", updateDoctorSchedule);
router.delete("/schedules/:scheduleId", deleteDoctorSchedule);

// =====================
// DOCTOR APPOINTMENTS
// GET /api/doctor/appointments
// PATCH /api/doctor/appointments/:appointmentId/status
// =====================
router.get("/appointments", getDoctorAppointments);
router.patch(
  "/appointments/:appointmentId/status",
  updateAppointmentStatusByDoctor
);

// =====================
// DOCTOR PRESCRIPTIONS CRUD
// GET /api/doctor/prescriptions
// POST /api/doctor/prescriptions
// PATCH /api/doctor/prescriptions/:prescriptionId
// DELETE /api/doctor/prescriptions/:prescriptionId
// =====================
router.get("/prescriptions", getDoctorPrescriptions);
router.post("/prescriptions", createPrescription);
router.patch("/prescriptions/:prescriptionId", updatePrescription);
router.delete("/prescriptions/:prescriptionId", deletePrescription);

module.exports = router;