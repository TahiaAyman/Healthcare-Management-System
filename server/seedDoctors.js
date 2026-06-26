const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Doctor = require("./models/Doctor");

dotenv.config();

const doctors = [
  {
    doctorName: "Dr. Ahmed Rahman",
    specialization: "Cardiology",
    qualifications: "MBBS, MD Cardiology",
    experience: 8,
    consultationFee: 500,
    hospitalName: "MediCare Heart Center",
    profileImage:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500",
    availableDays: ["Sunday", "Tuesday", "Thursday"],
    availableSlots: ["10:00 AM", "11:30 AM", "04:00 PM"],
    verificationStatus: "pending",
  },
  {
    doctorName: "Dr. Sabrina Karim",
    specialization: "Neurology",
    qualifications: "MBBS, FCPS Neurology",
    experience: 12,
    consultationFee: 800,
    hospitalName: "Central Neuro Hospital",
    profileImage:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=500",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "12:00 PM", "05:00 PM"],
    verificationStatus: "verified",
  },
  {
    doctorName: "Dr. Tanvir Hasan",
    specialization: "Dermatology",
    qualifications: "MBBS, DDV",
    experience: 5,
    consultationFee: 300,
    hospitalName: "Skin Care Clinic",
    profileImage:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500",
    availableDays: ["Sunday", "Monday", "Wednesday"],
    availableSlots: ["10:30 AM", "02:00 PM", "06:00 PM"],
    verificationStatus: "pending",
  },
  {
    doctorName: "Dr. Nusrat Jahan",
    specialization: "Pediatrics",
    qualifications: "MBBS, DCH",
    experience: 7,
    consultationFee: 450,
    hospitalName: "Child Health Hospital",
    profileImage:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["09:30 AM", "01:00 PM", "04:30 PM"],
    verificationStatus: "verified",
  },
  {
    doctorName: "Dr. Mahfuz Alam",
    specialization: "Orthopedics",
    qualifications: "MBBS, MS Orthopedics",
    experience: 10,
    consultationFee: 700,
    hospitalName: "MediCare Bone Center",
    profileImage:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500",
    availableDays: ["Monday", "Wednesday", "Saturday"],
    availableSlots: ["11:00 AM", "03:00 PM", "07:00 PM"],
    verificationStatus: "pending",
  },
  {
    doctorName: "Dr. Farhana Islam",
    specialization: "Gynecology",
    qualifications: "MBBS, FCPS Gynecology",
    experience: 9,
    consultationFee: 650,
    hospitalName: "Women Care Hospital",
    profileImage:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500",
    availableDays: ["Sunday", "Tuesday", "Thursday"],
    availableSlots: ["10:00 AM", "01:30 PM", "05:30 PM"],
    verificationStatus: "verified",
  },
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);

    console.log("Unique doctors inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDoctors();