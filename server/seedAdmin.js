const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminEmail = "admin@medicare.com";
    const adminPassword = "Admin@123";

    const existingAdmin = await User.findOne({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.name = "MediCare Admin";
      existingAdmin.role = "admin";
      existingAdmin.password = hashedPassword;
      existingAdmin.status = "active";

      await existingAdmin.save();

      console.log("Existing admin updated successfully");
      console.log("Admin Email:", adminEmail);
      console.log("Admin Password:", adminPassword);

      process.exit(0);
    }

    await User.create({
      name: "MediCare Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      photo: "",
      phone: "",
      gender: "",
      status: "active",
    });

    console.log("Admin created successfully");
    console.log("Admin Email:", adminEmail);
    console.log("Admin Password:", adminPassword);

    process.exit(0);
  } catch (error) {
    console.log("Admin seed error:", error.message);
    process.exit(1);
  }
};

createAdmin();