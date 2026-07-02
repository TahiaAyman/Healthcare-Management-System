const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// =====================
// INIT
// =====================
dotenv.config();
const app = express();

// =====================
// MIDDLEWARE
// =====================

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  "https://healthcare-management-system-topaz.vercel.app",
  "https://healthcare-management-system-hphzvzlv9-tahiaaymans-projects.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// =====================
// DATABASE CONNECT
// =====================
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("Mongo Error:", err);
    throw err;
  }
};

// Connect database before every API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =====================
// ROUTES
// =====================

// HOME PUBLIC ROUTES
const homeRoutes = require("./routes/homeRoutes");
app.use("/api/home", homeRoutes);

// AUTH ROUTES
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// USER / PROFILE ROUTES
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// PUBLIC / ADMIN DOCTOR ROUTES
const doctorRoutes = require("./routes/doctorRoutes");
app.use("/api/doctors", doctorRoutes);

// DOCTOR DASHBOARD ROUTES
const doctorDashboardRoutes = require("./routes/doctorDashboardRoutes");
app.use("/api/doctor", doctorDashboardRoutes);

// APPOINTMENT ROUTES
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

// REVIEW ROUTES
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

// PRESCRIPTION ROUTES
const prescriptionRoutes = require("./routes/prescriptionRoutes");
app.use("/api/prescriptions", prescriptionRoutes);

// PAYMENT / STRIPE ROUTES
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

// ADMIN APPOINTMENT ROUTES
const adminAppointmentRoutes = require("./routes/adminAppointmentRoutes");
app.use("/api/admin/appointments", adminAppointmentRoutes);

// ADMIN ANALYTICS ROUTES
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// ADMIN ROUTES
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// TEST ROUTES
const testRoutes = require("./routes/testRoutes");
app.use("/api/test", testRoutes);

// =====================
// ROOT ROUTE
// =====================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "MediCare Connect API is running successfully 🚀",
  });
});

// =====================
// 404 API ROUTE
// =====================
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});