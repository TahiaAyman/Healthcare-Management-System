"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  HeartPulse,
  ShieldCheck,
  Star,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type HomeStats = {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalReviews: number;
};

type FeaturedDoctor = {
  _id: string;
  doctorName: string;
  specialization: string;
  experience?: number;
  consultationFee?: number;
  profileImage?: string;
  hospitalName?: string;
  verificationStatus?: string;
  rating?: number;
};

type SuccessStory = {
  _id: string;
  patientName: string;
  patientPhoto?: string;
  doctorName: string;
  specialization: string;
  rating: number;
  reviewText: string;
  createdAt?: string;
};

type HomeData = {
  stats: HomeStats;
  featuredDoctors: FeaturedDoctor[];
  successStories: SuccessStory[];
};

const defaultHomeData: HomeData = {
  stats: {
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalReviews: 0,
  },
  featuredDoctors: [],
  successStories: [],
};

function formatNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k+`;
  }

  return value.toString();
}

function getPatientImage(story: SuccessStory) {
  return (
    story.patientPhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      story.patientName || "Patient"
    )}&background=0f766e&color=ffffff`
  );
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData>(defaultHomeData);
  const [homeLoading, setHomeLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      setHomeLoading(true);

      const res = await fetch(`${API_BASE_URL}/home`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load home data");
      }

      setHomeData({
        stats: data.stats || defaultHomeData.stats,
        featuredDoctors: data.featuredDoctors || [],
        successStories: data.successStories || [],
      });
    } catch (error) {
      console.error("Failed to load home data:", error);
      setHomeData(defaultHomeData);
    } finally {
      setHomeLoading(false);
    }
  };

  useEffect(() => {
    document.title = "MediCare Connect | Healthcare Management System";
    fetchHomeData();
  }, []);

  return (
    <div className="bg-[#ecf8f6] text-gray-900 dark:bg-slate-950 dark:text-white">
      {/* ================= HERO SECTION ================= */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-semibold text-teal-600 dark:text-teal-400">
            Smart Healthcare Platform
          </p>

          <h1 className="text-4xl font-bold leading-tight text-gray-950 dark:text-white md:text-5xl">
            Your Health, <span className="text-teal-600">Our Priority</span>
          </h1>

          <p className="mt-5 leading-relaxed text-gray-600 dark:text-slate-300">
            Book appointments with verified doctors, manage medical records,
            make secure payments, and access healthcare services anytime with a
            seamless digital experience.
          </p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/doctors"
              className="rounded-xl bg-teal-600 px-6 py-3 text-center font-bold text-white shadow-md transition hover:bg-teal-700"
            >
              Find Doctors
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-teal-600 px-6 py-3 text-center font-bold text-teal-600 transition hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-500/10"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-teal-100 to-blue-100 opacity-70 blur-2xl dark:from-teal-500/20 dark:to-blue-500/20" />

          <img
            src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1400&auto=format&fit=crop"
            className="relative h-[430px] w-full rounded-2xl object-cover shadow-xl"
            alt="Healthcare"
          />
        </motion.div>
      </section>

      {/* ================= MEDICAL SPECIALIZATIONS ================= */}
      <section className="border-t border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Medical <span className="text-teal-600">Specializations</span>
            </h2>

            <p className="mt-2 text-gray-500 dark:text-slate-300">
              Find expert doctors across all major healthcare fields
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { name: "Cardiology", icon: "❤️" },
              { name: "Neurology", icon: "🧠" },
              { name: "Orthopedics", icon: "🦴" },
              { name: "Pediatrics", icon: "👶" },
              { name: "Dermatology", icon: "✨" },
              { name: "Oncology", icon: "🎗️" },
              { name: "ENT", icon: "👂" },
              { name: "Gynecology", icon: "🌸" },
            ].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-xl transition group-hover:bg-teal-600 dark:bg-teal-500/10">
                  <span className="transition group-hover:text-white">
                    {item.icon}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 transition group-hover:text-teal-600 dark:text-white">
                  {item.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
                  Book specialist doctors instantly
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC STATS ================= */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-950 dark:to-slate-900"
      >
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-gray-950 dark:text-white">
              Platform Impact
            </h2>

            <p className="mt-2 text-gray-500 dark:text-slate-300">
              Real-time platform statistics loaded from database
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                label: "Doctors",
                value: homeData.stats.totalDoctors,
                icon: Stethoscope,
              },
              {
                label: "Patients",
                value: homeData.stats.totalPatients,
                icon: Users,
              },
              {
                label: "Appointments",
                value: homeData.stats.totalAppointments,
                icon: CalendarCheck,
              },
              {
                label: "Reviews",
                value: homeData.stats.totalReviews,
                icon: Star,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-4xl font-bold text-teal-600 dark:text-teal-300">
                    {homeLoading ? "..." : formatNumber(item.value)}
                  </h3>

                  <p className="mt-2 text-gray-500 dark:text-slate-300">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ================= FEATURED DOCTORS - DYNAMIC ================= */}
      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="text-4xl font-extrabold text-teal-600 dark:text-teal-300 md:text-5xl">
              Featured Doctors
            </h2>

            <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Consult Verified Healthcare Specialists
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-slate-300">
              Showing verified doctors from the database. Doctors are displayed
              here after admin verification.
            </p>
          </div>

          {homeLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-4 h-48 rounded-xl bg-gradient-to-tr from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-700" />
                  <div className="h-5 w-2/3 rounded bg-gray-100 dark:bg-slate-800" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-gray-100 dark:bg-slate-800" />
                  <div className="mt-5 h-10 rounded-xl bg-gray-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : homeData.featuredDoctors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-slate-700 dark:bg-slate-950">
              <Stethoscope className="mx-auto h-14 w-14 text-teal-600 dark:text-teal-300" />

              <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                No verified doctors found
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
                Featured doctors will appear here after the admin verifies
                doctor profiles.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {homeData.featuredDoctors.map((doctor) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="relative mb-5 h-52 overflow-hidden rounded-xl bg-gradient-to-tr from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={doctor.doctorName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-teal-600 dark:text-teal-300">
                        <UserRound size={70} />
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {doctor.doctorName}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-teal-600 dark:text-teal-300">
                        {doctor.specialization}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
                      <Star size={14} />
                      {doctor.rating || 0}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-slate-300">
                    <p>Experience: {doctor.experience || 0}+ years</p>
                    <p>Fee: ${doctor.consultationFee || 0}</p>
                    <p>
                      Hospital:{" "}
                      {doctor.hospitalName || "MediCare Partner Hospital"}
                    </p>
                  </div>

                  <Link
                    href={`/doctors/${doctor._id}`}
                    className="mt-5 inline-flex w-full justify-center rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
                  >
                    View Profile
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= WHY CHOOSE ================= */}
      <section className="relative border-t border-gray-100 bg-gradient-to-b from-white to-teal-50 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Why Choose <span className="text-teal-600">MediCare?</span>
            </h2>

            <p className="mt-2 text-gray-500 dark:text-slate-300">
              Modern healthcare made simple, secure, and fast
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Secure Medical Records",
                desc: "Your data is protected with secure authentication and role-based access control.",
                color: "from-teal-400 to-teal-600",
                icon: ShieldCheck,
              },
              {
                title: "Instant Appointment Booking",
                desc: "Book doctors in seconds without waiting or manual paperwork.",
                color: "from-blue-400 to-blue-600",
                icon: Activity,
              },
              {
                title: "Verified Doctors Only",
                desc: "Only approved and verified doctors are available in the system.",
                color: "from-purple-400 to-purple-600",
                icon: HeartPulse,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div
                    className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${item.color}`}
                  />

                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${item.color} font-bold text-white shadow-md`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 transition group-hover:text-teal-600 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-slate-300">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC TESTIMONIALS ================= */}
      <section className="bg-[#eefef8] dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-gray-950 dark:text-white">
              Patient Success Stories
            </h2>

            <p className="mt-2 text-gray-500 dark:text-slate-300">
              Real patient testimonials loaded from the reviews collection
            </p>
          </div>

          {homeLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : homeData.successStories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <Star className="mx-auto h-14 w-14 text-teal-600 dark:text-teal-300" />

              <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                No patient success stories found
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-slate-300">
                Reviews from patients will appear here dynamically.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {homeData.successStories.map((story) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getPatientImage(story)}
                      alt={story.patientName}
                      className="h-12 w-12 rounded-full object-cover"
                    />

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {story.patientName}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Consulted {story.doctorName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={18}
                        fill={index < story.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>

                  <p className="mt-5 leading-7 text-gray-600 dark:text-slate-300">
                    &quot;{story.reviewText}&quot;
                  </p>

                  <p className="mt-4 text-sm font-bold text-teal-600 dark:text-teal-300">
                    {story.specialization}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}