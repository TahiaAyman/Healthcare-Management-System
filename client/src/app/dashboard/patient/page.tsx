"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock3,
  CreditCard,
  Heart,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  UserCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PatientStats = {
  upcomingAppointments: number;
  appointmentHistory: number;
  totalPayments: number;
  favoriteDoctors: number;
};

type RecentAppointment = {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentStatus: string;
  paymentStatus: string;
  symptoms?: string;
  doctorId?: {
    _id: string;
    doctorName: string;
    specialization: string;
    consultationFee: number;
    profileImage?: string;
    hospitalName?: string;
  };
};

const defaultStats: PatientStats = {
  upcomingAppointments: 0,
  appointmentHistory: 0,
  totalPayments: 0,
  favoriteDoctors: 0,
};

export default function PatientDashboardPage() {
  const { user, token, loading } = useAuth();

  const [stats, setStats] = useState<PatientStats>(defaultStats);
  const [recentAppointments, setRecentAppointments] = useState<
    RecentAppointment[]
  >([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatientSummary = async () => {
    try {
      setDataLoading(true);
      setError("");

      const savedToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("medicare_token") ||
            localStorage.getItem("token")
          : null);

      if (!savedToken) {
        setError("No login token found. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/appointments/patient/summary`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch patient dashboard");
      }

      setStats(data.stats || defaultStats);
      setRecentAppointments(data.recentAppointments || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Patient Dashboard | MediCare Connect";

    if (!loading && user?.role === "patient") {
      fetchPatientSummary();
    }
  }, [loading, user?.role]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Loading Patient Dashboard
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Preparing your patient panel...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <ShieldAlert className="mx-auto h-14 w-14 text-red-500 dark:text-red-300" />

          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            Unauthorized Access
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            This dashboard is only for patient users.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      subtitle: "Pending or accepted appointments",
      icon: CalendarCheck,
    },
    {
      title: "Appointment History",
      value: stats.appointmentHistory,
      subtitle: "Total appointment records",
      icon: Clock3,
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      subtitle: "Paid appointment records",
      icon: CreditCard,
    },
    {
      title: "Favorite Doctors",
      value: stats.favoriteDoctors,
      subtitle: "Doctors you booked before",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase tracking-wide text-teal-600 dark:text-teal-300">
              Patient Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Welcome, {user.name}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              Manage appointments, payments, reviews, and your healthcare
              activity from one secure patient panel.
            </p>
          </div>

          <button
            onClick={fetchPatientSummary}
            disabled={dataLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3 font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <RefreshCw
              className={`h-5 w-5 ${dataLoading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Icon className="h-7 w-7" />
                </div>

                <p className="mt-8 font-bold text-slate-700 dark:text-slate-300">
                  {item.title}
                </p>

                <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">
                  {dataLoading ? "..." : item.value}
                </h2>

                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Patient Feature Cards */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
              <UserCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                Patient Features
              </h2>
              <p className="mt-2 text-slate-700 dark:text-slate-300">
                Required patient dashboard modules.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureLink
              href="/dashboard/patient/appointments"
              title="My Appointments"
              description="View, reschedule, cancel appointments, and view prescriptions."
            />

            <FeatureLink
              href="/dashboard/patient/payments"
              title="Payment History"
              description="View paid appointments and transaction records."
            />

            <FeatureLink
              href="/dashboard/patient/reviews"
              title="My Reviews"
              description="Add, update, or delete doctor reviews."
            />
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
              <Stethoscope className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                Recent Appointments
              </h2>
              <p className="mt-2 text-slate-700 dark:text-slate-300">
                Latest appointment records from database.
              </p>
            </div>
          </div>

          {dataLoading ? (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center font-bold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              Loading appointments...
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                No appointments yet
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Book a doctor appointment from the Find Doctors page.
              </p>

              <Link
                href="/doctors"
                className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700"
              >
                Find Doctors
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-4 md:items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Doctor
                    </p>
                    <h3 className="mt-1 font-black text-slate-950 dark:text-white">
                      {appointment.doctorId?.doctorName || "Doctor"}
                    </h3>
                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">
                      {appointment.doctorId?.specialization || "Specialist"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Schedule
                    </p>
                    <p className="mt-1 font-bold text-slate-900 dark:text-white">
                      {appointment.appointmentDate?.slice(0, 10)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {appointment.appointmentTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Status
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${
                        appointment.appointmentStatus === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                          : appointment.appointmentStatus === "accepted"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                          : appointment.appointmentStatus === "rejected" ||
                            appointment.appointmentStatus === "cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300"
                      }`}
                    >
                      {appointment.appointmentStatus}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Payment
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${
                        appointment.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      }`}
                    >
                      {appointment.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10"
    >
      <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>

      <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </Link>
  );
}