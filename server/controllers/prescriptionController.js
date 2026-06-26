const mongoose = require("mongoose");
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");

// ===============================
// PATIENT: GET PRESCRIPTION BY APPOINTMENT
// GET /api/prescriptions/my/appointment/:appointmentId
// ===============================
const getMyPrescriptionByAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { appointmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment id",
      });
    }

    // Patient নিজের appointment কিনা verify করা হচ্ছে
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found for this patient",
      });
    }

    if (appointment.appointmentStatus !== "completed") {
      return res.status(400).json({
        message: "Prescription is available only after appointment completion",
      });
    }

    const prescription = await Prescription.findOne({
      appointmentId,
      patientId,
    })
      .populate("doctorId", "doctorName specialization hospitalName profileImage")
      .populate("patientId", "name email phone gender photo")
      .populate(
        "appointmentId",
        "appointmentDate appointmentTime symptoms appointmentStatus paymentStatus"
      );

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not created yet",
      });
    }

    return res.status(200).json({
      message: "Prescription fetched successfully",
      prescription,
    });
  } catch (error) {
    console.log("Get patient prescription error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch prescription",
    });
  }
};

// ===============================
// PATIENT: GET ALL MY PRESCRIPTIONS
// GET /api/prescriptions/my
// ===============================
const getMyPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;

    const prescriptions = await Prescription.find({
      patientId,
    })
      .populate("doctorId", "doctorName specialization hospitalName profileImage")
      .populate("patientId", "name email phone gender photo")
      .populate(
        "appointmentId",
        "appointmentDate appointmentTime symptoms appointmentStatus paymentStatus"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "My prescriptions fetched successfully",
      prescriptions,
    });
  } catch (error) {
    console.log("Get my prescriptions error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch prescriptions",
    });
  }
};

module.exports = {
  getMyPrescriptionByAppointment,
  getMyPrescriptions,
};