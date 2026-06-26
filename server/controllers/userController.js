const User = require("../models/User");

// ==============================
// GET LOGGED-IN USER PROFILE
// ROUTE: GET /api/users/me
// ACCESS: Logged-in user
// ==============================
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// ==============================
// UPDATE LOGGED-IN USER PROFILE
// ROUTE: PATCH /api/users/me
// ROUTE: PATCH /api/users/profile
// ACCESS: Logged-in user
// ==============================
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, photo, gender } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(photo !== undefined && { photo }),
        ...(gender !== undefined && { gender }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ==============================
// GET ALL USERS
// ROUTE: GET /api/users
// ACCESS: Admin only
// ==============================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ==============================
// SUSPEND USER
// ROUTE: PATCH /api/users/:id/suspend
// ACCESS: Admin only
// ==============================
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot suspend own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status: "suspended" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to suspend user",
      error: error.message,
    });
  }
};

// ==============================
// ACTIVATE USER
// ROUTE: PATCH /api/users/:id/activate
// ACCESS: Admin only
// ==============================
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User activated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to activate user",
      error: error.message,
    });
  }
};

// ==============================
// DELETE USER
// ROUTE: DELETE /api/users/:id
// ACCESS: Admin only
// ==============================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete own account",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};