const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      default: "",
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
  {
    // Logged-in doctor user account er sathe doctor profile link korar jonno
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // Doctor registration er shomoy specialization na thakleo profile create hobe
    specialization: {
      type: String,
      default: "Not specified",
      trim: true,
    },

    qualifications: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    hospitalName: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    availableDays: {
      type: [String],
      default: [],
    },

    availableSlots: {
      type: [String],
      default: [],
    },

    schedules: {
      type: [scheduleSchema],
      default: [],
    },

    // Doctor register korle initially pending thakbe
    // Admin verify korar por Find Doctors page e show korbe
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);