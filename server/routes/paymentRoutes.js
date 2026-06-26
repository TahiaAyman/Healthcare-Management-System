const express = require("express");

const {
  createCheckoutSession,
  verifyCheckoutSession,
  getMyPayments,
  getAllPaymentsForAdmin,
} = require("../controllers/paymentController");

const {
  verifyToken,
  verifyPatient,
  verifyAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// PATIENT PAYMENT ROUTES
// ===============================

// Create Stripe checkout session
// POST /api/payments/create-checkout-session
router.post(
  "/create-checkout-session",
  verifyToken,
  verifyPatient,
  createCheckoutSession
);

// Verify Stripe payment after success
// PATCH /api/payments/verify-session
router.patch(
  "/verify-session",
  verifyToken,
  verifyPatient,
  verifyCheckoutSession
);

// Get logged-in patient's payment history
// GET /api/payments/my-payments
router.get("/my-payments", verifyToken, verifyPatient, getMyPayments);

// ===============================
// ADMIN PAYMENT ROUTES
// ===============================

// Admin can view all payment records
// GET /api/payments/admin/all
router.get("/admin/all", verifyToken, verifyAdmin, getAllPaymentsForAdmin);

module.exports = router;