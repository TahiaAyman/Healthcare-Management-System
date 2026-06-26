const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");

// ===============================
// CREATE STRIPE CHECKOUT SESSION
// POST /api/payments/create-checkout-session
// ===============================
exports.createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID is required",
      });
    }

    const userId = req.user?.id || req.user?._id;

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email")
      .populate(
        "doctorId",
        "doctorName specialization consultationFee hospitalName"
      );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (!appointment.patientId || !appointment.doctorId) {
      return res.status(400).json({
        message: "Invalid appointment. Patient or doctor information missing.",
      });
    }

    if (appointment.patientId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only pay for your own appointment",
      });
    }

    if (appointment.appointmentStatus === "cancelled") {
      return res.status(400).json({
        message: "Cancelled appointment cannot be paid",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This appointment is already paid",
      });
    }

    const consultationFee = Number(appointment.doctorId.consultationFee || 0);

    if (!consultationFee || consultationFee <= 0) {
      return res.status(400).json({
        message: "Doctor consultation fee is invalid",
      });
    }

    // Remove old pending payment records for the same appointment
    await Payment.deleteMany({
      appointmentId: appointment._id,
      paymentStatus: "pending",
    });

    const payment = await Payment.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      amount: consultationFee,
      currency: "usd",
      paymentStatus: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      customer_email: appointment.patientId.email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation with ${appointment.doctorId.doctorName}`,
              description: `${appointment.doctorId.specialization} | ${
                appointment.doctorId.hospitalName || "MediCare Connect"
              }`,
            },
            unit_amount: Math.round(consultationFee * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        paymentId: payment._id.toString(),
        appointmentId: appointment._id.toString(),
        patientId: appointment.patientId._id.toString(),
        doctorId: appointment.doctorId._id.toString(),
      },

      success_url: `${process.env.CLIENT_URL}/dashboard/patient/payments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/patient/payments?payment=cancelled`,
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    return res.status(200).json({
      message: "Stripe checkout session created successfully",
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.log("Create checkout session error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create checkout session",
    });
  }
};

// ===============================
// VERIFY STRIPE CHECKOUT SESSION
// PATCH /api/payments/verify-session
// ===============================
exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Stripe session ID is required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Stripe session not found",
      });
    }

    const payment = await Payment.findOne({
      stripeSessionId: sessionId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    if (session.payment_status !== "paid") {
      payment.paymentStatus = "failed";
      await payment.save();

      return res.status(400).json({
        message: "Payment is not completed",
        paymentStatus: session.payment_status,
      });
    }

    payment.paymentStatus = "paid";
    payment.transactionId =
      session.payment_intent || session.id || payment.stripeSessionId;
    payment.paymentDate = new Date();
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointmentId, {
      paymentStatus: "paid",
    });

    return res.status(200).json({
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    console.log("Verify checkout session error:", error);

    return res.status(500).json({
      message: error.message || "Failed to verify payment",
    });
  }
};

// ===============================
// GET PATIENT PAYMENT HISTORY
// GET /api/payments/my-payments
// ===============================
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const payments = await Payment.find({
      patientId: userId,
    })
      .populate("doctorId", "doctorName specialization consultationFee")
      .populate(
        "appointmentId",
        "appointmentDate appointmentTime appointmentStatus paymentStatus symptoms"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Payment history loaded successfully",
      total: payments.length,
      payments,
    });
  } catch (error) {
    console.log("Get my payments error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load payment history",
    });
  }
};

// ===============================
// ADMIN: GET ALL PAYMENT RECORDS
// GET /api/payments/admin/all
// ===============================
exports.getAllPaymentsForAdmin = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("patientId", "name email phone photo")
      .populate("doctorId", "doctorName specialization consultationFee")
      .populate(
        "appointmentId",
        "appointmentDate appointmentTime appointmentStatus paymentStatus symptoms"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All payment records loaded successfully",
      total: payments.length,
      payments,
    });
  } catch (error) {
    console.log("Admin get payments error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load payment records",
    });
  }
};