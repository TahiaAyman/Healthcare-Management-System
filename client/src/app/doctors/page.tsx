"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  DollarSign,
  Loader2,
  Search,
  Star,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Doctor = {
  _id: string;
  doctorName?: string;
  name?: string;
  specialization?: string;
  experience?: number | string;
  consultationFee?: number | string;
  hospitalName?: string;
  profileImage?: string;
  image?: string;
  verificationStatus?: string;
  rating?: number;
  avgRating?: number;
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doctorsPerPage = 3;

  const getDoctorName = (doctor: Doctor) =>
    doctor.doctorName || doctor.name || "Unnamed Doctor";

  const getFee = (doctor: Doctor) => Number(doctor.consultationFee || 0);

  const getExperience = (doctor: Doctor) => Number(doctor.experience || 0);

  const getRating = (doctor: Doctor) =>
    Number(doctor.avgRating || doctor.averageRating || doctor.rating || 0);

  const getReviewCount = (doctor: Doctor) =>
    Number(doctor.reviewCount || doctor.totalReviews || 0);

  useEffect(() => {
    document.title = "Find Doctors | MediCare Connect";

    async function fetchDoctors() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/doctors`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch doctors");
        }

        const doctorList = Array.isArray(data) ? data : data.doctors || [];

        setDoctors(doctorList);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);

  const verifiedDoctors = useMemo(() => {
    return doctors.filter(
      (doctor) =>
        String(doctor.verificationStatus || "").toLowerCase() === "verified"
    );
  }, [doctors]);

  const specializations = useMemo(() => {
    const unique = new Set<string>();

    verifiedDoctors.forEach((doctor) => {
      if (doctor.specialization) {
        unique.add(doctor.specialization);
      }
    });

    return Array.from(unique);
  }, [verifiedDoctors]);

  const filteredDoctors = useMemo(() => {
    let result = [...verifiedDoctors];

    const searchText = search.toLowerCase().trim();

    if (searchText) {
      result = result.filter((doctor) => {
        const name = getDoctorName(doctor).toLowerCase();
        const spec = String(doctor.specialization || "").toLowerCase();
        const hospital = String(doctor.hospitalName || "").toLowerCase();

        return (
          name.includes(searchText) ||
          spec.includes(searchText) ||
          hospital.includes(searchText)
        );
      });
    }

    if (specialization !== "all") {
      result = result.filter(
        (doctor) =>
          String(doctor.specialization || "").toLowerCase() ===
          specialization.toLowerCase()
      );
    }

    if (sortBy === "fee-low") {
      result.sort((a, b) => getFee(a) - getFee(b));
    }

    if (sortBy === "fee-high") {
      result.sort((a, b) => getFee(b) - getFee(a));
    }

    if (sortBy === "experience") {
      result.sort((a, b) => getExperience(b) - getExperience(a));
    }

    if (sortBy === "rating") {
      result.sort((a, b) => getRating(b) - getRating(a));
    }

    return result;
  }, [verifiedDoctors, search, specialization, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, specialization, sortBy]);

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * doctorsPerPage;
    return filteredDoctors.slice(start, start + doctorsPerPage);
  }, [filteredDoctors, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-blue-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
            Find Doctors
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-slate-700 dark:text-slate-300">
            Search, filter, sort, and book verified doctors instantly from the
            MediCare Connect platform.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                placeholder="Search doctor, specialization, hospital"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-teal-500/10"
              />
            </div>

            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-teal-500/10"
            >
              <option value="all">All Specializations</option>
              {specializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-teal-500/10"
            >
              <option value="default">Sort By</option>
              <option value="fee-low">Consultation Fee: Low to High</option>
              <option value="fee-high">Consultation Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Showing{" "}
            <span className="font-black text-teal-700 dark:text-teal-300">
              {filteredDoctors.length}
            </span>{" "}
            verified doctors
          </p>

          {(search || specialization !== "all" || sortBy !== "default") && (
            <button
              onClick={() => {
                setSearch("");
                setSpecialization("all");
                setSortBy("default");
              }}
              className="w-fit rounded-full border border-teal-300 bg-white px-5 py-2 font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
            <h3 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
              Loading doctors
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Fetching verified doctors from database...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white p-12 text-center shadow-sm dark:border-red-500/30 dark:bg-slate-900">
            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
              Failed to load doctors
            </h3>
            <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && paginatedDoctors.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            {paginatedDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <DoctorAvatar doctor={doctor} />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-2xl font-black leading-tight text-slate-950 dark:text-white">
                        {getDoctorName(doctor)}
                      </h2>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-500/10 dark:text-green-300">
                        Verified
                      </span>
                    </div>

                    <p className="mt-2 font-black text-teal-700 dark:text-teal-300">
                      {doctor.specialization || "Specialization not added"}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-4">
                  <SmallInfo
                    icon={<CalendarDays size={18} />}
                    title="Experience"
                    value={`${getExperience(doctor)} years`}
                  />

                  <SmallInfo
                    icon={<DollarSign size={18} />}
                    title="Fee"
                    value={`$${getFee(doctor)}`}
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Building2 size={18} />
                    <span className="font-bold">Hospital</span>
                  </div>

                  <p className="mt-2 font-black text-slate-950 dark:text-white">
                    {doctor.hospitalName || "Not added yet"}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <Star
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    {getRating(doctor) > 0
                      ? getRating(doctor).toFixed(1)
                      : "No rating"}
                  </div>

                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {getReviewCount(doctor)} reviews
                  </p>
                </div>

                <Link
                  href={`/doctors/${doctor._id}`}
                  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-teal-600 px-5 py-4 font-black text-white transition hover:bg-teal-700"
                >
                  View Profile / Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && paginatedDoctors.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-black text-slate-950 dark:text-white">
              No verified doctors found
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Try another doctor name, specialization, or hospital name.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-11 w-11 rounded-full border font-black transition ${
                    currentPage === page
                      ? "border-teal-600 bg-teal-600 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function DoctorAvatar({ doctor }: { doctor: Doctor }) {
  const [imageError, setImageError] = useState(false);

  const doctorName = doctor.doctorName || doctor.name || "Doctor";
  const imageSrc = String(doctor.profileImage || doctor.image || "").trim();
  const initial = doctorName.charAt(0).toUpperCase() || "D";

  if (imageSrc && !imageError) {
    return (
      <img
        src={imageSrc}
        alt={doctorName}
        onError={() => setImageError(true)}
        className="h-20 w-20 shrink-0 rounded-3xl border-4 border-teal-100 object-cover dark:border-teal-500/30"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-teal-100 bg-teal-50 text-3xl font-black text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300">
      {initial}
    </div>
  );
}

function SmallInfo({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        {icon}
        <span className="font-bold">{title}</span>
      </div>

      <p className="mt-2 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}