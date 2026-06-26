const express = require("express");
const router = express.Router();

const {
  createDoctor,
  getAllDoctors,
  getPublicDoctors,
  getDoctorById,
  getDoctorsForAdmin,
  updateDoctorVerificationStatus,
} = require("../controllers/doctorController");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// =======================
// ADMIN ROUTES
// =======================
router.get(
  "/admin/all/doctors",
  verifyToken,
  authorizeRoles("admin"),
  getDoctorsForAdmin
);

router.patch(
  "/admin/status/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateDoctorVerificationStatus
);

// =======================
// PUBLIC ROUTES
// =======================
router.get("/public", getPublicDoctors);
router.post("/", createDoctor);
router.get("/", getAllDoctors);

// এই route সবশেষে থাকবে
router.get("/:id", getDoctorById);

module.exports = router;