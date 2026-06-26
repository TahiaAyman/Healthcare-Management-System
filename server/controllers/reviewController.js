const mongoose = require("mongoose");
const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

// PATIENT: CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, rating, reviewText } = req.body;

    if (!doctorId || !rating || !reviewText) {
      return res.status(400).json({
        message: "Doctor, rating, and review text are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor id",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const review = await Review.create({
      patientId,
      doctorId,
      rating: Number(rating),
      reviewText,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("doctorId", "doctorName specialization profileImage hospitalName")
      .populate("patientId", "name email photo");

    res.status(201).json({
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add review",
      error: error.message,
    });
  }
};

// PATIENT: GET MY REVIEWS
exports.getMyReviews = async (req, res) => {
  try {
    const patientId = req.user.id;

    const reviews = await Review.find({ patientId })
      .populate("doctorId", "doctorName specialization profileImage hospitalName")
      .populate("patientId", "name email photo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "My reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// PATIENT: UPDATE MY REVIEW
exports.updateMyReview = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review id",
      });
    }

    if (!rating || !reviewText) {
      return res.status(400).json({
        message: "Rating and review text are required",
      });
    }

    const review = await Review.findOneAndUpdate(
      {
        _id: id,
        patientId,
      },
      {
        rating: Number(rating),
        reviewText,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("doctorId", "doctorName specialization profileImage hospitalName")
      .populate("patientId", "name email photo");

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// PATIENT: DELETE MY REVIEW
exports.deleteMyReview = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review id",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      patientId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// PUBLIC: GET ALL REVIEWS
exports.getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("doctorId", "doctorName specialization profileImage hospitalName")
      .populate("patientId", "name email photo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch public reviews",
      error: error.message,
    });
  }
};