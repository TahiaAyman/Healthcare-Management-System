"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Stethoscope,
  Loader2,
  Building2,
  DollarSign,
  CalendarDays,
} from "lucide-react";

type Doctor = {
  _id: string;
  doctorName: string;
  specialization: string;
  qualifications?: string;
  experience: number;
  consultationFee: number;
  hospitalName?: string;
  profileImage?: string;
  availableDays?: string[];
  availableSlots?: string[];
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function AdminDoctorsPage() {
  const { token } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return token || localStorage.getItem("token");
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/doctors/admin/all/doctors`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch doctors");
      }

      setDoctors(data.doctors || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    doctorId: string,
    verificationStatus: "pending" | "verified" | "rejected"
  ) => {
    try {
      setActionLoading(`${doctorId}-${verificationStatus}`);
      setError("");
      setSuccess("");

      const res = await fetch(
        `${API_BASE_URL}/doctors/admin/status/${doctorId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ verificationStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update doctor status");
      }

      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor._id === doctorId
            ? { ...doctor, verificationStatus }
            : doctor
        )
      );

      setSuccess(data.message || "Doctor status updated successfully");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const statusBadge = (status: Doctor["verificationStatus"]) => {
    if (status === "verified") {
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20";
    }

    return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20";
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <section className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-2 font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            <ArrowLeft size={18} />
            Back to Admin Dashboard
          </Link>

          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                Admin Panel
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Manage Doctors
              </h1>

              <p className="mt-4 max-w-3xl text-slate-500 dark:text-slate-300">
                View doctor profiles, verify pending doctors, reject invalid
                profiles, or cancel verification when needed.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Stethoscope size={24} />
                </div>

                <div>
                  <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                    {doctors.length}
                  </h2>

                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Total Doctors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600" />
                <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">
                  Loading doctors from database...
                </p>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Stethoscope className="mx-auto h-12 w-12 text-slate-400" />

              <h2 className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white">
                No doctors found
              </h2>

              <p className="mt-2 text-slate-500">
                Add doctors from backend/API first.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-teal-100 text-2xl font-extrabold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={doctor.doctorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        doctor.doctorName?.charAt(0)?.toUpperCase() || "D"
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                            {doctor.doctorName}
                          </h2>

                          <p className="mt-1 font-bold text-teal-600 dark:text-teal-400">
                            {doctor.specialization}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-extrabold capitalize ${statusBadge(
                            doctor.verificationStatus
                          )}`}
                        >
                          {doctor.verificationStatus}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <CalendarDays size={16} />
                            Experience
                          </p>

                          <h3 className="mt-1 font-extrabold text-slate-950 dark:text-white">
                            {doctor.experience || 0} years
                          </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <DollarSign size={16} />
                            Fee
                          </p>

                          <h3 className="mt-1 font-extrabold text-slate-950 dark:text-white">
                            ${doctor.consultationFee || 0}
                          </h3>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 sm:col-span-2">
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <Building2 size={16} />
                            Hospital
                          </p>

                          <h3 className="mt-1 font-extrabold text-slate-950 dark:text-white">
                            {doctor.hospitalName || "N/A"}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => updateStatus(doctor._id, "verified")}
                          disabled={actionLoading === `${doctor._id}-verified`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === `${doctor._id}-verified` ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                          Verify
                        </button>

                        <button
                          onClick={() => updateStatus(doctor._id, "rejected")}
                          disabled={actionLoading === `${doctor._id}-rejected`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === `${doctor._id}-rejected` ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <XCircle size={18} />
                          )}
                          Reject
                        </button>

                        <button
                          onClick={() => updateStatus(doctor._id, "pending")}
                          disabled={actionLoading === `${doctor._id}-pending`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-4 py-3 font-bold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === `${doctor._id}-pending` ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <ShieldAlert size={18} />
                          )}
                          Pending
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}