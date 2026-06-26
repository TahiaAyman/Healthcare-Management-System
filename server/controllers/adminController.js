const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

// ===============================
// ADMIN DASHBOARD STATS
// GET /api/admin/stats
// ===============================
exports.getAdminStats = async (req, res) => {
  try {
    // Total patients
    const totalPatients = await User.countDocuments({
      role: "patient",
      status: { $ne: "deleted" },
    });

    // Total doctors
    const totalDoctors = await Doctor.countDocuments();

    // Total reviews
    const totalReviews = await Review.countDocuments();

    // ===============================
    // VALID APPOINTMENTS ONLY
    // 1. cancelled appointment বাদ
    // 2. patient deleted/missing হলে বাদ
    // 3. doctor deleted/missing হলে বাদ
    // ===============================
    const appointments = await Appointment.find({
      appointmentStatus: { $ne: "cancelled" },
    })
      .populate("patientId", "_id")
      .populate("doctorId", "_id");

    const validAppointments = appointments.filter((appointment) => {
      return appointment.patientId && appointment.doctorId;
    });

    const totalAppointments = validAppointments.length;

    // ===============================
    // PAID PAYMENTS ONLY
    // ===============================
    const paidPayments = await Payment.find({
      paymentStatus: "paid",
    });

    const totalPayments = paidPayments.length;

    const totalRevenue = paidPayments.reduce((sum, payment) => {
      return sum + Number(payment.amount || 0);
    }, 0);

    return res.status(200).json({
      message: "Admin stats fetched successfully",
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalPayments,
        totalRevenue,
        totalReviews,
      },
    });
  } catch (error) {
    console.log("Admin stats error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin stats",
      error: error.message,
    });
  }
};