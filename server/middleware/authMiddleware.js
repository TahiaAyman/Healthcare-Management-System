const jwt = require("jsonwebtoken");

// =====================
// VERIFY JWT TOKEN
// =====================
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should contain: { id, email, role }
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// =====================
// VERIFY ADMIN ROLE
// =====================
exports.verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
};

// =====================
// VERIFY DOCTOR ROLE
// =====================
exports.verifyDoctor = (req, res, next) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json({
      message: "Doctor access only",
    });
  }

  next();
};

// =====================
// VERIFY PATIENT ROLE
// =====================
exports.verifyPatient = (req, res, next) => {
  if (req.user?.role !== "patient") {
    return res.status(403).json({
      message: "Patient access only",
    });
  }

  next();
};