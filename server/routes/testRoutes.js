const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// TEST USER ROUTE
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Protected profile data",
    user: req.user,
  });
});

// ADMIN ONLY ROUTE
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Admin route working",
  });
});

module.exports = router;