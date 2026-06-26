"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  FileText,
  RefreshCw,
  Settings,
  Star,
  Users,
  XCircle,
} from "lucide-react";

import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { doctorDashboardAPI, type DoctorStats } from "@/services/api";

type ExtendedDoctorStats = DoctorStats & {
  doctorId?: string;
  doctorName?: string;
  totalAppointments?: number;
  acceptedAppointments?: number;
  rejectedAppointments?: number;
  appointmentStatusData?: {
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
  };
};

export default function DoctorDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<ExtendedDoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await doctorDashboardAPI.getStats();
      setStats(data as ExtendedDoctorStats);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load doctor dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Doctor Dashboard | MediCare Connect";
    fetchStats();
  }, []);

  const displayDoctorName = stats?.doctorName || user?.name || "Doctor";

  const cards = [
    {
      icon: <Users size={22} />,
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      description: "Unique patients who booked you",
    },
    {
      icon: <ClipboardList size={22} />,
      title: "Total Appointments",
      value: stats?.totalAppointments || 0,
      description: "All appointments booked with you",
    },
    {
      icon: <CalendarCheck size={22} />,
      title: "Today's Appointments",
      value: stats?.todaysAppointments || 0,
      description: "Appointments scheduled for today",
    },
    {
      icon: <CheckCircle size={22} />,
      title: "Completed",
      value: stats?.completedAppointments || 0,
      description: "Finished consultations",
    },
    {
      icon: <Star size={22} />,
      title: "Reviews Received",
      value: stats?.reviewsReceived || 0,
      description: "Patient feedback count",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <section className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 p-6 text-white shadow-lg md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-cyan-100">
                  Doctor Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                  Welcome, Dr. {displayDoctorName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50">
                  View your patients, appointments, consultation status, and
                  prescription work from one secure dashboard.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                  <AlertCircle size={16} />
                  Verification Status:
                  <span className="capitalize">
                    {stats?.verificationStatus || "pending"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchStats}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/25"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>

                <Link
                  href="/dashboard/doctor/profile"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-cyan-50"
                >
                  <Settings size={18} />
                  Update Profile
                </Link>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="animate-pulse rounded-2xl bg-slate-100 p-8 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Loading doctor dashboard...
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && errorMessage && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <h2 className="font-extrabold">Dashboard data failed to load</h2>

              <p className="mt-2 text-sm">{errorMessage}</p>

              <button
                onClick={fetchStats}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* MAIN CONTENT */}
          {!loading && !errorMessage && (
            <>
              {/* OVERVIEW CARDS */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map((card) => (
                  <DashboardCard
                    key={card.title}
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    description={card.description}
                  />
                ))}
              </div>

              {/* MAIN FEATURES */}
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                      Doctor Features
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Complete your doctor-side operations from the sections
                      below.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    API Connected
                  </span>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  <FeatureBox
                    href="/dashboard/doctor/schedule"
                    icon={<CalendarDays size={24} />}
                    title="Manage Schedule"
                    description="Add, update, and remove available consultation days and time slots."
                  />

                  <FeatureBox
                    href="/dashboard/doctor/appointments"
                    icon={<ClipboardList size={24} />}
                    title="Appointment Requests"
                    description="View your appointments, then accept, reject, or mark them as completed."
                  />

                  <FeatureBox
                    href="/dashboard/doctor/prescriptions"
                    icon={<FileText size={24} />}
                    title="Prescription Management"
                    description="Create and update prescriptions after consultation completion."
                  />
                </div>
              </div>

              {/* APPOINTMENT SUMMARY */}
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    Appointment Status
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Live status overview for appointments booked with you.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <StatusBox
                      title="Total Appointments"
                      value={stats?.totalAppointments || 0}
                      variant="slate"
                    />

                    <StatusBox
                      title="Pending"
                      value={stats?.pendingAppointments || 0}
                      variant="yellow"
                    />

                    <StatusBox
                      title="Accepted"
                      value={stats?.acceptedAppointments || 0}
                      variant="blue"
                    />

                    <StatusBox
                      title="Rejected"
                      value={stats?.rejectedAppointments || 0}
                      variant="red"
                    />

                    <StatusBox
                      title="Completed"
                      value={stats?.completedAppointments || 0}
                      variant="green"
                    />

                    <StatusBox
                      title="Today's Appointments"
                      value={stats?.todaysAppointments || 0}
                      variant="teal"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    Next Required Actions
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Follow these steps to keep your doctor dashboard updated.
                  </p>

                  <div className="mt-5 space-y-3">
                    <ActionItem text="Keep your available schedule updated." />
                    <ActionItem text="Check new appointment requests regularly." />
                    <ActionItem text="Accept or reject patient appointment requests." />
                    <ActionItem text="Mark consultations as completed after service." />
                    <ActionItem text="Create prescriptions only after appointment completion." />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}

function DashboardCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-bold text-slate-500 dark:text-slate-300">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FeatureBox({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}

function StatusBox({
  title,
  value,
  variant,
}: {
  title: string;
  value: number;
  variant: "slate" | "yellow" | "blue" | "red" | "green" | "teal";
}) {
  const variantClassMap = {
    slate:
      "bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    yellow:
      "bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-200",
    blue: "bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200",
    red: "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200",
    green:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
    teal: "bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-200",
  };

  return (
    <div className={`rounded-2xl p-5 ${variantClassMap[variant]}`}>
      <p className="text-sm font-bold">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold">{value}</h3>
    </div>
  );
}

function ActionItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />

      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {text}
      </p>
    </div>
  );
}