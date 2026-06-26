const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");

// ===============================
// ADMIN ANALYTICS
// GET /api/admin/analytics
// ===============================
exports.getAdminAnalytics = async (req, res) => {
  try {
    // ===============================
    // PLATFORM TOTALS
    // ===============================
    const totalPatients = await User.countDocuments({
      role: "patient",
      status: { $ne: "deleted" },
    });

    const totalDoctors = await Doctor.countDocuments();

    const totalReviews = await Review.countDocuments();

    // Count only valid appointments
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
    // APPOINTMENT STATUS CHART DATA
    // ===============================
    const appointmentStatusData = [
      {
        name: "Pending",
        value: validAppointments.filter(
          (item) => item.appointmentStatus === "pending"
        ).length,
      },
      {
        name: "Accepted",
        value: validAppointments.filter(
          (item) => item.appointmentStatus === "accepted"
        ).length,
      },
      {
        name: "Completed",
        value: validAppointments.filter(
          (item) => item.appointmentStatus === "completed"
        ).length,
      },
      {
        name: "Rejected",
        value: validAppointments.filter(
          (item) => item.appointmentStatus === "rejected"
        ).length,
      },
    ];

    // ===============================
    // PLATFORM SUMMARY CHART DATA
    // ===============================
    const platformSummary = [
      {
        name: "Patients",
        value: totalPatients,
      },
      {
        name: "Doctors",
        value: totalDoctors,
      },
      {
        name: "Appointments",
        value: totalAppointments,
      },
      {
        name: "Reviews",
        value: totalReviews,
      },
    ];

    // ===============================
    // DOCTOR PERFORMANCE BY RATING
    // ===============================
    const doctorRatingResult = await Review.aggregate([
      {
        $group: {
          _id: "$doctorId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $sort: {
          averageRating: -1,
          totalReviews: -1,
        },
      },
      {
        $limit: 8,
      },
    ]);

    const doctorPerformance = await Promise.all(
      doctorRatingResult.map(async (item) => {
        const doctor = await Doctor.findById(item._id).select(
          "doctorName specialization consultationFee"
        );

        if (!doctor) return null;

        return {
          doctorId: doctor._id,
          doctorName: doctor.doctorName,
          specialization: doctor.specialization,
          consultationFee: doctor.consultationFee || 0,
          averageRating: Number(item.averageRating.toFixed(1)),
          totalReviews: item.totalReviews,
        };
      })
    );

    const validDoctorPerformance = doctorPerformance.filter(Boolean);

    return res.status(200).json({
      message: "Admin analytics loaded successfully",
      analytics: {
        platformSummary,
        appointmentStatusData,
        doctorPerformance: validDoctorPerformance,
      },
    });
  } catch (error) {
    console.log("Admin analytics error:", error);

    return res.status(500).json({
      message: "Failed to load admin analytics",
      error: error.message,
    });
  }
};