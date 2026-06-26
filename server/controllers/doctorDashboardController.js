const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Review = require("../models/Review");

// ===============================
// DATE HELPER
// ===============================
const getLocalDateKey = (date = new Date()) => {
  const d = new Date(date);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalizeAppointmentDate = (value) => {
  if (!value) return "";

  if (value instanceof Date) {
    return getLocalDateKey(value);
  }

  const stringValue = String(value);

  // If appointmentDate is saved like "2026-06-26"
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  // If appointmentDate is saved like ISO string
  if (stringValue.includes("T")) {
    return stringValue.split("T")[0];
  }

  return stringValue;
};

// ===============================
// GET LOGGED-IN USER SAFELY
// ===============================
const getLoggedInUser = async (req) => {
  const userId = req.user?.id || req.user?._id || req.user?.userId;
  const email = req.user?.email?.toLowerCase();

  let user = null;

  if (userId) {
    user = await User.findById(userId);
  }

  if (!user && email) {
    user = await User.findOne({ email });
  }

  return user;
};

// ===============================
// FIND OR CREATE LOGGED-IN DOCTOR PROFILE
// Important:
// - No random doctor
// - No first doctor
// - Only logged-in doctor userId/email
// ===============================
const findLoggedInDoctor = async (req) => {
  const loggedInUser = await getLoggedInUser(req);

  if (!loggedInUser || loggedInUser.role !== "doctor") {
    return null;
  }

  const userId = loggedInUser._id;
  const userEmail = loggedInUser.email.toLowerCase();

  // 1. First priority: exact userId match
  let doctor = await Doctor.findOne({
    userId,
  });

  // 2. Second priority: same email but only if old profile is not linked with another user
  if (!doctor) {
    doctor = await Doctor.findOne({
      email: userEmail,
      $or: [{ userId }, { userId: null }, { userId: { $exists: false } }],
    });
  }

  // 3. If no profile exists, create new pending doctor profile
  if (!doctor) {
    doctor = await Doctor.create({
      userId,
      email: userEmail,
      doctorName: loggedInUser.name || "New Doctor",
      specialization: "Not specified",
      qualifications: "",
      experience: 0,
      consultationFee: 0,
      hospitalName: "",
      profileImage: loggedInUser.photo || "",
      availableDays: [],
      availableSlots: [],
      schedules: [],
      verificationStatus: "pending",
      status: "active",
    });

    return doctor;
  }

  // 4. Fix old doctor document safely
  let needSave = false;

  if (!doctor.userId) {
    doctor.userId = userId;
    needSave = true;
  }

  if (!doctor.email) {
    doctor.email = userEmail;
    needSave = true;
  }

  if (!doctor.doctorName) {
    doctor.doctorName = loggedInUser.name || "New Doctor";
    needSave = true;
  }

  if (!doctor.specialization) {
    doctor.specialization = "Not specified";
    needSave = true;
  }

  if (!doctor.profileImage && loggedInUser.photo) {
    doctor.profileImage = loggedInUser.photo;
    needSave = true;
  }

  if (!Array.isArray(doctor.availableDays)) {
    doctor.availableDays = [];
    needSave = true;
  }

  if (!Array.isArray(doctor.availableSlots)) {
    doctor.availableSlots = [];
    needSave = true;
  }

  if (!Array.isArray(doctor.schedules)) {
    doctor.schedules = [];
    needSave = true;
  }

  if (!doctor.verificationStatus) {
    doctor.verificationStatus = "pending";
    needSave = true;
  }

  if (!doctor.status) {
    doctor.status = "active";
    needSave = true;
  }

  if (needSave) {
    await doctor.save();
  }

  return doctor;
};

// ===============================
// DOCTOR PROFILE
// GET /api/doctor/profile
// ===============================
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    console.log("Get doctor profile error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load doctor profile",
    });
  }
};

// ===============================
// UPDATE DOCTOR PROFILE
// PATCH /api/doctor/profile
// ===============================
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const {
      doctorName,
      specialization,
      qualifications,
      experience,
      consultationFee,
      hospitalName,
      profileImage,
      availableDays,
      availableSlots,
    } = req.body;

    if (doctorName !== undefined) doctor.doctorName = doctorName;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualifications !== undefined) doctor.qualifications = qualifications;
    if (hospitalName !== undefined) doctor.hospitalName = hospitalName;
    if (profileImage !== undefined) doctor.profileImage = profileImage;

    if (experience !== undefined) {
      doctor.experience = Number(experience) || 0;
    }

    if (consultationFee !== undefined) {
      doctor.consultationFee = Number(consultationFee) || 0;
    }

    if (Array.isArray(availableDays)) {
      doctor.availableDays = availableDays;
    }

    if (Array.isArray(availableSlots)) {
      doctor.availableSlots = availableSlots;
    }

    await doctor.save();

    return res.status(200).json({
      message: "Profile updated successfully. Admin can verify this doctor now.",
      doctor,
    });
  } catch (error) {
    console.log("Update doctor profile error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update profile",
    });
  }
};

// ===============================
// DASHBOARD STATS
// GET /api/doctor/stats
// ===============================
const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const today = getLocalDateKey();

    // Only logged-in doctor er appointment count hobe
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentStatus: { $ne: "cancelled" },
    });

    const totalAppointments = appointments.length;

    const totalPatients = new Set(
      appointments
        .filter((item) => item.patientId)
        .map((item) => item.patientId.toString())
    ).size;

    const todaysAppointments = appointments.filter((item) => {
      return normalizeAppointmentDate(item.appointmentDate) === today;
    }).length;

    const pendingAppointments = appointments.filter(
      (item) => item.appointmentStatus === "pending"
    ).length;

    const acceptedAppointments = appointments.filter(
      (item) => item.appointmentStatus === "accepted"
    ).length;

    const rejectedAppointments = appointments.filter(
      (item) => item.appointmentStatus === "rejected"
    ).length;

    const completedAppointments = appointments.filter(
      (item) => item.appointmentStatus === "completed"
    ).length;

    const reviewsReceived = await Review.countDocuments({
      doctorId: doctor._id,
    });

    return res.status(200).json({
      doctorId: doctor._id,
      doctorName: doctor.doctorName,
      verificationStatus: doctor.verificationStatus || "pending",

      totalPatients,
      totalAppointments,
      todaysAppointments,
      pendingAppointments,
      acceptedAppointments,
      rejectedAppointments,
      completedAppointments,
      reviewsReceived,

      appointmentStatusData: {
        pending: pendingAppointments,
        accepted: acceptedAppointments,
        rejected: rejectedAppointments,
        completed: completedAppointments,
      },
    });
  } catch (error) {
    console.log("Doctor dashboard stats error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load dashboard stats",
    });
  }
};

// ===============================
// SCHEDULE CRUD
// ===============================
const getDoctorSchedules = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json(doctor.schedules || []);
  } catch (error) {
    console.log("Get doctor schedules error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load schedules",
    });
  }
};

const addDoctorSchedule = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { day, date, startTime, endTime } = req.body;

    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        message: "Day, start time and end time are required",
      });
    }

    doctor.schedules.push({
      day,
      date: date || "",
      startTime,
      endTime,
      isAvailable: true,
    });

    const slotText = `${startTime} - ${endTime}`;

    if (!doctor.availableDays.includes(day)) {
      doctor.availableDays.push(day);
    }

    if (!doctor.availableSlots.includes(slotText)) {
      doctor.availableSlots.push(slotText);
    }

    await doctor.save();

    return res.status(201).json({
      message: "Schedule added successfully",
      schedules: doctor.schedules,
    });
  } catch (error) {
    console.log("Add doctor schedule error:", error);

    return res.status(500).json({
      message: error.message || "Failed to add schedule",
    });
  }
};

const updateDoctorSchedule = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { scheduleId } = req.params;
    const schedule = doctor.schedules.id(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    const { day, date, startTime, endTime, isAvailable } = req.body;

    if (day !== undefined) schedule.day = day;
    if (date !== undefined) schedule.date = date;
    if (startTime !== undefined) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;
    if (isAvailable !== undefined) schedule.isAvailable = isAvailable;

    doctor.availableDays = [
      ...new Set(
        doctor.schedules
          .filter((item) => item.isAvailable)
          .map((item) => item.day)
      ),
    ];

    doctor.availableSlots = [
      ...new Set(
        doctor.schedules
          .filter((item) => item.isAvailable)
          .map((item) => `${item.startTime} - ${item.endTime}`)
      ),
    ];

    await doctor.save();

    return res.status(200).json({
      message: "Schedule updated successfully",
      schedules: doctor.schedules,
    });
  } catch (error) {
    console.log("Update doctor schedule error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update schedule",
    });
  }
};

const deleteDoctorSchedule = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { scheduleId } = req.params;

    doctor.schedules = (doctor.schedules || []).filter(
      (item) => item._id.toString() !== scheduleId
    );

    doctor.availableDays = [
      ...new Set(
        doctor.schedules
          .filter((item) => item.isAvailable)
          .map((item) => item.day)
      ),
    ];

    doctor.availableSlots = [
      ...new Set(
        doctor.schedules
          .filter((item) => item.isAvailable)
          .map((item) => `${item.startTime} - ${item.endTime}`)
      ),
    ];

    await doctor.save();

    return res.status(200).json({
      message: "Schedule removed successfully",
      schedules: doctor.schedules,
    });
  } catch (error) {
    console.log("Delete doctor schedule error:", error);

    return res.status(500).json({
      message: error.message || "Failed to remove schedule",
    });
  }
};

// ===============================
// APPOINTMENTS
// GET /api/doctor/appointments
// ===============================
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentStatus: { $ne: "cancelled" },
    })
      .populate("patientId", "name email photo phone gender")
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.log("Get doctor appointments error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load appointments",
    });
  }
};

// ===============================
// UPDATE APPOINTMENT STATUS
// PATCH /api/doctor/appointments/:appointmentId/status
// ===============================
const updateAppointmentStatusByDoctor = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ["accepted", "rejected", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (status === "accepted" && appointment.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Appointment cannot be accepted before payment",
      });
    }

    appointment.appointmentStatus = status;
    await appointment.save();

    const updatedStatsAppointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentStatus: { $ne: "cancelled" },
    });

    const stats = {
      totalAppointments: updatedStatsAppointments.length,
      pendingAppointments: updatedStatsAppointments.filter(
        (item) => item.appointmentStatus === "pending"
      ).length,
      acceptedAppointments: updatedStatsAppointments.filter(
        (item) => item.appointmentStatus === "accepted"
      ).length,
      rejectedAppointments: updatedStatsAppointments.filter(
        (item) => item.appointmentStatus === "rejected"
      ).length,
      completedAppointments: updatedStatsAppointments.filter(
        (item) => item.appointmentStatus === "completed"
      ).length,
    };

    return res.status(200).json({
      message: `Appointment ${status} successfully`,
      appointment,
      stats,
      redirectToPrescription:
        status === "completed"
          ? `/dashboard/doctor/prescriptions?appointmentId=${appointment._id}`
          : null,
    });
  } catch (error) {
    console.log("Update appointment status error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update appointment status",
    });
  }
};

// ===============================
// PRESCRIPTIONS
// ===============================
const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const prescriptions = await Prescription.find({
      doctorId: doctor._id,
    })
      .populate("patientId", "name email phone")
      .populate("appointmentId", "appointmentDate appointmentTime symptoms")
      .sort({ createdAt: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.log("Get doctor prescriptions error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load prescriptions",
    });
  }
};

const createPrescription = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { appointmentId, diagnosis, medications, notes } = req.body;

    if (!appointmentId || !diagnosis || !medications) {
      return res.status(400).json({
        message: "Appointment, diagnosis and medications are required",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.appointmentStatus !== "completed") {
      return res.status(400).json({
        message: "Prescription can be created only after completion",
      });
    }

    const existingPrescription = await Prescription.findOne({
      appointmentId,
    });

    if (existingPrescription) {
      return res.status(400).json({
        message: "Prescription already exists for this appointment",
      });
    }

    const prescription = await Prescription.create({
      doctorId: doctor._id,
      patientId: appointment.patientId,
      appointmentId,
      diagnosis,
      medications,
      notes: notes || "",
    });

    return res.status(201).json({
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.log("Create prescription error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create prescription",
    });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { prescriptionId } = req.params;
    const { diagnosis, medications, notes } = req.body;

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      doctorId: doctor._id,
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (medications !== undefined) prescription.medications = medications;
    if (notes !== undefined) prescription.notes = notes;

    await prescription.save();

    return res.status(200).json({
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.log("Update prescription error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update prescription",
    });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const doctor = await findLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const { prescriptionId } = req.params;

    const prescription = await Prescription.findOneAndDelete({
      _id: prescriptionId,
      doctorId: doctor._id,
    });

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.log("Delete prescription error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete prescription",
    });
  }
};

module.exports = {
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
};