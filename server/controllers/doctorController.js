const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");

// Escape regex special characters
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// =======================
// CREATE DOCTOR
// =======================
exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create({
      ...req.body,
      verificationStatus: req.body.verificationStatus || "pending",
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create doctor",
      error: err.message,
    });
  }
};

// =======================
// PUBLIC: VERIFIED DOCTORS ONLY
// GET /api/doctors
// =======================
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.aggregate([
      {
        $match: {
          verificationStatus: "verified",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "doctorId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          totalReviews: { $size: "$reviews" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.status(200).json({
      message: "Verified doctors fetched successfully",
      doctors,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: err.message,
    });
  }
};

// =======================
// PUBLIC: SEARCH + FILTER + SORT + PAGINATION
// GET /api/doctors/public
// =======================
exports.getPublicDoctors = async (req, res) => {
  try {
    const {
      search = "",
      specialization = "all",
      sortBy = "default",
      page = 1,
      limit = 6,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.max(Number(limit) || 6, 1);

    const matchStage = {
      verificationStatus: "verified",
    };

    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      matchStage.$or = [
        { doctorName: { $regex: safeSearch, $options: "i" } },
        { specialization: { $regex: safeSearch, $options: "i" } },
        { hospitalName: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (specialization && specialization !== "all") {
      matchStage.specialization = {
        $regex: `^${escapeRegex(specialization)}$`,
        $options: "i",
      };
    }

    let sortStage = { createdAt: -1 };

    if (sortBy === "fee-low") {
      sortStage = { consultationFee: 1, createdAt: -1 };
    }

    if (sortBy === "fee-high") {
      sortStage = { consultationFee: -1, createdAt: -1 };
    }

    if (sortBy === "experience") {
      sortStage = { experience: -1, createdAt: -1 };
    }

    if (sortBy === "rating") {
      sortStage = { averageRating: -1, reviewCount: -1, createdAt: -1 };
    }

    const result = await Doctor.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "doctorId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          totalReviews: { $size: "$reviews" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
      { $sort: sortStage },
      {
        $facet: {
          doctors: [
            { $skip: (currentPage - 1) * perPage },
            { $limit: perPage },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const doctors = result[0]?.doctors || [];
    const totalDoctors = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalDoctors / perPage) || 1;

    res.status(200).json({
      message: "Public verified doctors fetched successfully",
      doctors,
      totalDoctors,
      currentPage,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch public doctors",
      error: err.message,
    });
  }
};

// =======================
// GET SINGLE DOCTOR
// GET /api/doctors/:id
// =======================
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid doctor id",
      });
    }

    const result = await Doctor.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "doctorId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          totalReviews: { $size: "$reviews" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
    ]);

    const doctor = result[0];

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      message: "Doctor fetched successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch doctor",
      error: err.message,
    });
  }
};

// =======================
// ADMIN: GET ALL DOCTORS
// =======================
exports.getDoctorsForAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Admin doctors fetched successfully",
      doctors,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch admin doctors",
      error: err.message,
    });
  }
};

// =======================
// ADMIN: UPDATE DOCTOR STATUS
// =======================
exports.updateDoctorVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    const allowedStatuses = ["pending", "verified", "rejected"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid doctor id",
      });
    }

    if (!allowedStatuses.includes(verificationStatus)) {
      return res.status(400).json({
        message: "Invalid verification status",
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { verificationStatus },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      message: `Doctor status updated to ${verificationStatus}`,
      doctor,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update doctor status",
      error: err.message,
    });
  }
};