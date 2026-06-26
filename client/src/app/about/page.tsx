"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type HomeStats = {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalReviews: number;
};

const defaultStats: HomeStats = {
  totalDoctors: 0,
  totalPatients: 0,
  totalAppointments: 0,
  totalReviews: 0,
};

const features = [
  {
    title: "Smart Appointment System",
    desc: "Patients can search verified doctors, check availability, and book appointments quickly.",
    icon: "📅",
  },
  {
    title: "Secure Medical Records",
    desc: "Healthcare records and appointment data are stored securely with protected access.",
    icon: "🔐",
  },
  {
    title: "Verified Doctors",
    desc: "Doctors are verified by admins before patients can book consultations with them.",
    icon: "✅",
  },
  {
    title: "Stripe Payment System",
    desc: "Patients can pay consultation fees securely before appointment confirmation.",
    icon: "💳",
  },
  {
    title: "Role-Based Dashboard",
    desc: "Separate dashboard experiences for patients, doctors, and administrators.",
    icon: "🧑‍⚕️",
  },
  {
    title: "Analytics & Reports",
    desc: "Admins can monitor appointments, payments, doctors, and platform performance.",
    icon: "📊",
  },
];

const statCards = [
  { label: "Verified Doctors", key: "totalDoctors" },
  { label: "Active Patients", key: "totalPatients" },
  { label: "Appointments", key: "totalAppointments" },
  { label: "Patient Reviews", key: "totalReviews" },
] as const;

const steps = [
  "Search verified doctors",
  "Choose available schedule",
  "Pay consultation fee",
  "Confirm appointment",
];

function formatNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K+`;
  }

  return value.toString();
}

export default function AboutPage() {
  const [stats, setStats] = useState<HomeStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/home`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load about stats");
      }

      setStats(data.stats || defaultStats);
    } catch (error) {
      console.error("About stats error:", error);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "About Us | MediCare Connect";
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-50 via-white to-blue-50 border-b border-gray-100">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-sm border border-teal-100"
          >
            Modern Healthcare Management Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-6 text-4xl md:text-6xl font-bold tracking-tight"
          >
            About <span className="text-teal-600">MediCare Connect</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mt-5 max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed"
          >
            MediCare Connect connects patients, doctors, and administrators through
            one secure digital healthcare ecosystem for appointments, payments,
            schedules, reviews, and medical records.
          </motion.p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/doctors"
              className="rounded-xl bg-teal-600 px-7 py-3 font-semibold text-white shadow-md hover:bg-teal-700 transition"
            >
              Find Doctors
            </Link>

            <Link
              href="/contact"
              className="rounded-xl border border-teal-600 px-7 py-3 font-semibold text-teal-700 hover:bg-teal-50 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
            Our Mission
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
            Reducing waiting time and improving healthcare access
          </h2>

          <p className="mt-5 text-gray-600 leading-relaxed">
            Traditional healthcare appointment systems often depend on manual
            paperwork, phone calls, and long queues. MediCare Connect is designed
            to digitize appointment booking, improve doctor schedule management,
            secure medical records, and create a seamless healthcare experience.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              "Digital Booking",
              "Secure Records",
              "Doctor Verification",
              "Fast Payments",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <p className="mt-3 font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-teal-200 to-blue-200 blur-2xl opacity-60"></div>

          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80"
            alt="Healthcare professionals"
            className="relative h-[420px] w-full rounded-3xl object-cover shadow-xl"
          />

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 backdrop-blur p-5 shadow-lg border border-white">
            <p className="text-sm text-gray-500">Platform Goal</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">
              Seamless patient-doctor connection
            </h3>
          </div>
        </motion.div>
      </section>

      {/* ================= STATS ================= */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/10 border border-white/20 p-7 text-center text-white backdrop-blur"
            >
              <h3 className="text-4xl font-bold">
                {loading ? "..." : formatNumber(stats[item.key])}
              </h3>
              <p className="mt-2 text-teal-50">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
              Platform Features
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Why Choose <span className="text-teal-600">MediCare Connect?</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Built for patients, doctors, and admins with secure, scalable, and
              role-based healthcare operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group rounded-3xl border border-gray-100 bg-[#f8fafc] p-7 shadow-sm hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center text-xl group-hover:bg-teal-600 transition">
                  <span className="group-hover:scale-110 transition">
                    {item.icon}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-gradient-to-b from-teal-50 to-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              How the System Works
            </h2>
            <p className="text-gray-500 mt-3">
              A simple digital flow from searching doctors to confirmed appointments.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={step}
                className="relative rounded-3xl bg-white border border-gray-100 p-7 shadow-sm"
              >
                <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="mt-5 font-bold text-gray-900">{step}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Complete this step securely through the platform.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VISION CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-blue-700 text-white shadow-2xl">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-black/10 rounded-full blur-3xl"></div>

          <div className="relative px-8 md:px-16 py-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Our Vision
            </h2>

            <p className="mt-6 text-white/90 max-w-3xl mx-auto leading-relaxed text-base md:text-lg">
              To transform healthcare into a fully connected digital ecosystem
              where every patient receives instant access to verified doctors,
              transparent healthcare data, and secure medical services — without
              delays, confusion, or physical barriers.
            </p>

            <div className="mt-10 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur">
                <h3 className="font-semibold text-lg">Instant Access</h3>
                <p className="text-sm text-white/80 mt-2">
                  Reduce waiting time with real-time doctor availability.
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur">
                <h3 className="font-semibold text-lg">Secure System</h3>
                <p className="text-sm text-white/80 mt-2">
                  End-to-end encrypted medical records and payments.
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur">
                <h3 className="font-semibold text-lg">Trusted Network</h3>
                <p className="text-sm text-white/80 mt-2">
                  Only verified doctors and admin-approved profiles.
                </p>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-12 inline-flex bg-white text-teal-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              Join MediCare Connect
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}