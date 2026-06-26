const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Review = require("./models/Review");

dotenv.config();

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    let patient = await User.findOne({ email: "seedpatient@medicare.com" });

    if (!patient) {
      const hashedPassword = await bcrypt.hash("Patient@123", 10);

      patient = await User.create({
        name: "Seed Patient",
        email: "seedpatient@medicare.com",
        password: hashedPassword,
        role: "patient",
        status: "active",
      });

      console.log("Seed patient created");
    }

    const doctors = await Doctor.find({ verificationStatus: "verified" }).sort({
      createdAt: -1,
    });

    if (!doctors.length) {
      console.log("No verified doctors found. Please verify doctors first.");
      process.exit(0);
    }

    await Review.deleteMany({
      reviewText: { $regex: "Seed review for rating sort", $options: "i" },
    });

    const ratingPatterns = [
      [5, 5],
      [5, 4],
      [4, 5],
      [4, 4],
      [5, 3],
      [3, 4],
      [5, 5],
      [4, 5],
    ];

    const reviews = [];

    doctors.forEach((doctor, index) => {
      const ratings = ratingPatterns[index % ratingPatterns.length];

      ratings.forEach((rating, ratingIndex) => {
        reviews.push({
          patientId: patient._id,
          doctorId: doctor._id,
          rating,
          reviewText: `Seed review for rating sort - ${doctor.doctorName} - ${ratingIndex + 1}`,
        });
      });
    });

    await Review.insertMany(reviews);

    console.log(`${reviews.length} seed reviews inserted successfully`);
    console.log("Rating sort will now work on Find Doctors page.");

    process.exit(0);
  } catch (error) {
    console.log("Seed review error:", error.message);
    process.exit(1);
  }
};

seedReviews();