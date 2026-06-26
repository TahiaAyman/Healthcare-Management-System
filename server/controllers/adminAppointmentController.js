const Appointment = require("../models/Appointment");

// =====================
// ADMIN: GET ALL VALID APPOINTMENTS
// GET /api/admin/appointments
// =====================
const getAllAppointmentsForAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      appointmentStatus: { $ne: "cancelled" },
    })
      .populate("patientId", "name email phone photo gender")
      .populate(
        "doctorId",
        "doctorName specialization consultationFee hospitalName profileImage"
      )
      .sort({ createdAt: -1 });

    // Remove broken/old appointment records where patient or doctor no longer exists
    const validAppointments = appointments.filter((appointment) => {
      return appointment.patientId && appointment.doctorId;
    });

    return res.status(200).json({
      message: "Appointments loaded successfully",
      total: validAppointments.length,
      appointments: validAppointments,
    });
  } catch (error) {
    console.log("Admin get appointments error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load appointments",
    });
  }
};

module.exports = {
  getAllAppointmentsForAdmin,
};