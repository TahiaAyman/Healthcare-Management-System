const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Doctor = require("../models/Doctor");

// =====================
// JWT TOKEN GENERATOR
// =====================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================
// SAFE USER RESPONSE
// =====================
const formatUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: user.photo,
    phone: user.phone,
    gender: user.gender,
    status: user.status,
  };
};

// =====================
// ENSURE DOCTOR PROFILE
// Doctor role user er jonno Doctors collection e linked profile create/update korbe
// =====================
const ensureDoctorProfile = async (user) => {
  if (!user || user.role !== "doctor") return null;

  const email = user.email.toLowerCase();

  let doctorProfile = await Doctor.findOne({
    $or: [{ userId: user._id }, { email }],
  });

  if (!doctorProfile) {
    doctorProfile = await Doctor.create({
      userId: user._id,
      email,
      doctorName: user.name || "New Doctor",
      specialization: "Not specified",
      qualifications: "",
      experience: 0,
      consultationFee: 0,
      hospitalName: "",
      profileImage: user.photo || "",
      availableDays: [],
      availableSlots: [],
      schedules: [],
      verificationStatus: "pending",
      status: "active",
    });

    return doctorProfile;
  }

  let needSave = false;

  if (!doctorProfile.userId) {
    doctorProfile.userId = user._id;
    needSave = true;
  }

  if (!doctorProfile.email) {
    doctorProfile.email = email;
    needSave = true;
  }

  if (!doctorProfile.doctorName) {
    doctorProfile.doctorName = user.name || "New Doctor";
    needSave = true;
  }

  if (!doctorProfile.profileImage && user.photo) {
    doctorProfile.profileImage = user.photo;
    needSave = true;
  }

  if (!doctorProfile.verificationStatus) {
    doctorProfile.verificationStatus = "pending";
    needSave = true;
  }

  if (needSave) {
    await doctorProfile.save();
  }

  return doctorProfile;
};

// =====================
// REGISTER
// POST /api/auth/register
// =====================
const register = async (req, res) => {
  try {
    const { name, email, password, role, photo, phone, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include at least one number and one special character",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Public registration e only patient/doctor allow kora safe
    // Admin account seed/manual vabe create kora uchit
    const allowedPublicRoles = ["patient", "doctor"];
    const finalRole = allowedPublicRoles.includes(role) ? role : "patient";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      photo: photo || "",
      phone: phone || "",
      gender: gender || "",
      status: "active",
    });

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await ensureDoctorProfile(user);
    }

    return res.status(201).json({
      message:
        user.role === "doctor"
          ? "Doctor registration successful. Your profile is pending admin verification."
          : "Registration successful",
      user: formatUserResponse(user),
      doctorProfile,
    });
  } catch (error) {
    console.log("Register error:", error);

    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

// =====================
// LOGIN
// POST /api/auth/login
// =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await ensureDoctorProfile(user);
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
      doctorProfile,
    });
  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

// =====================
// GOOGLE LOGIN
// POST /api/auth/google-login
// =====================
const googleLogin = async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Google email is required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // New Google user patient hisebe create hobe
    // Existing doctor/admin Google diye login korle existing role preserve hobe
    if (!user) {
      const randomPassword = `${Date.now()}Google@123`;
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        password: hashedPassword,
        role: "patient",
        photo: photo || "",
        phone: "",
        gender: "",
        status: "active",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended",
      });
    }

    let needSave = false;

    if (!user.name && name) {
      user.name = name;
      needSave = true;
    }

    if (!user.photo && photo) {
      user.photo = photo;
      needSave = true;
    }

    if (needSave) {
      await user.save();
    }

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await ensureDoctorProfile(user);
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: formatUserResponse(user),
      doctorProfile,
    });
  } catch (error) {
    console.log("Google login error:", error);

    return res.status(500).json({
      message: error.message || "Google login failed",
    });
  }
};

// =====================
// GET CURRENT USER
// GET /api/auth/me
// =====================
const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let doctorProfile = null;

    if (user.role === "doctor") {
      doctorProfile = await ensureDoctorProfile(user);
    }

    return res.status(200).json({
      user,
      doctorProfile,
    });
  } catch (error) {
    console.log("Get me error:", error);

    return res.status(500).json({
      message: error.message || "Failed to load user",
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
};