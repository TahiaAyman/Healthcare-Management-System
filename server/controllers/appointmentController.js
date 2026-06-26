const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");

// CREATE APPOINTMENT - PATIENT
exports.createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;

    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      symptoms,
      appointmentStatus,
      paymentStatus,
    } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "Doctor, appointment date, and appointment time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor id",
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      symptoms: symptoms || "",
      appointmentStatus: appointmentStatus || "pending",
      paymentStatus: paymentStatus || "unpaid",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// PATIENT DASHBOARD SUMMARY
exports.getPatientDashboardSummary = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({ patientId })
      .populate(
        "doctorId",
        "doctorName specialization consultationFee profileImage hospitalName"
      )
      .sort({ createdAt: -1 });

    const activeAppointments = appointments.filter(
      (item) => item.appointmentStatus !== "cancelled"
    );

    const upcomingAppointments = activeAppointments.filter((item) =>
      ["pending", "accepted"].includes(item.appointmentStatus)
    ).length;

    const appointmentHistory = activeAppointments.length;

    // IMPORTANT FIX:
    // Total Payments now comes from Payment collection, not Appointment collection.
    // Because Stripe payment creates Payment records and stores paid status there.
    const totalPayments = await Payment.countDocuments({
      patientId,
      paymentStatus: "paid",
    });

    const favoriteDoctorIds = new Set(
      activeAppointments
        .filter((item) => item.doctorId)
        .map((item) => item.doctorId._id.toString())
    );

    const recentAppointments = activeAppointments.slice(0, 5);

    res.status(200).json({
      message: "Patient dashboard summary fetched successfully",
      stats: {
        upcomingAppointments,
        appointmentHistory,
        totalPayments,
        favoriteDoctors: favoriteDoctorIds.size,
      },
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patient dashboard summary",
      error: error.message,
    });
  }
};

// PATIENT: GET MY APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patientId,
      appointmentStatus: { $ne: "cancelled" },
    })
      .populate(
        "doctorId",
        "doctorName specialization consultationFee profileImage hospitalName"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "My appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// PATIENT: CANCEL MY APPOINTMENT
exports.cancelMyAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid appointment id",
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        patientId,
      },
      {
        appointmentStatus: "cancelled",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

// PATIENT: RESCHEDULE MY APPOINTMENT
exports.rescheduleMyAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { appointmentDate, appointmentTime } = req.body;

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "Appointment date and time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid appointment id",
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        patientId,
      },
      {
        appointmentDate,
        appointmentTime,
        appointmentStatus: "pending",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reschedule appointment",
      error: error.message,
    });
  }
};

// PATIENT: DELETE CANCELLED APPOINTMENT HISTORY
exports.deleteMyCancelledAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid appointment id",
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.appointmentStatus !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled appointment history can be deleted",
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      message: "Cancelled appointment history deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete appointment history",
      error: error.message,
    });
  }
};