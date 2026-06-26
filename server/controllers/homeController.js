const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");

// ===============================
// PUBLIC HOME DATA
// GET /api/home
// ===============================
exports.getHomeData = async (req, res) => {
  try {
    // ===============================
    // PLATFORM DYNAMIC STATS
    // ===============================
    const totalDoctors = await Doctor.countDocuments();

    const totalPatients = await User.countDocuments({
      role: "patient",
      status: { $ne: "deleted" },
    });

    const totalReviews = await Review.countDocuments();

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
    // FEATURED DOCTORS
    // ===============================
    const featuredDoctors = await Doctor.find({
      verificationStatus: "verified",
    })
      .select(
        "doctorName specialization experience consultationFee profileImage hospitalName verificationStatus"
      )
      .sort({ createdAt: -1 })
      .limit(3);

    // If no verified doctors found, fallback to latest doctors
    const doctorsForHome =
      featuredDoctors.length > 0
        ? featuredDoctors
        : await Doctor.find()
            .select(
              "doctorName specialization experience consultationFee profileImage hospitalName verificationStatus"
            )
            .sort({ createdAt: -1 })
            .limit(3);

    // ===============================
    // PATIENT SUCCESS STORIES
    // ===============================
    const successStories = await Review.find()
      .populate("patientId", "name photo")
      .populate("doctorId", "doctorName specialization")
      .sort({ createdAt: -1 })
      .limit(6);

    const formattedStories = successStories
      .filter((review) => review.patientId && review.doctorId)
      .map((review) => ({
        _id: review._id,
        patientName: review.patientId.name,
        patientPhoto: review.patientId.photo || "",
        doctorName: review.doctorId.doctorName,
        specialization: review.doctorId.specialization,
        rating: review.rating,
        reviewText: review.reviewText,
        createdAt: review.createdAt,
      }));

    return res.status(200).json({
      message: "Home data loaded successfully",
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalReviews,
      },
      featuredDoctors: doctorsForHome,
      successStories: formattedStories,
    });
  } catch (error) {
    console.log("Home data error:", error);

    return res.status(500).json({
      message: "Failed to load home data",
      error: error.message,
    });
  }
};