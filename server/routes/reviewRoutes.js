const express = require("express");
const router = express.Router();

const {
  createReview,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getPublicReviews,
} = require("../controllers/reviewController");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// PUBLIC REVIEWS
router.get("/", getPublicReviews);

// PATIENT REVIEWS
router.post("/", verifyToken, authorizeRoles("patient"), createReview);

router.get(
  "/my",
  verifyToken,
  authorizeRoles("patient"),
  getMyReviews
);

router.patch(
  "/my/:id",
  verifyToken,
  authorizeRoles("patient"),
  updateMyReview
);

router.delete(
  "/my/:id",
  verifyToken,
  authorizeRoles("patient"),
  deleteMyReview
);

module.exports = router;