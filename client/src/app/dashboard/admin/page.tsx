"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type AdminStats = {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalPayments: number;
  totalRevenue: number;
  totalReviews: number;
};

type ChartItem = {
  name: string;
  value: number;
};

type DoctorPerformance = {
  doctorId: string;
  doctorName: string;
  specialization: string;
  consultationFee: number;
  averageRating: number;
  totalReviews: number;
};

type AdminAnalytics = {
  platformSummary: ChartItem[];
  appointmentStatusData: ChartItem[];
  doctorPerformance: DoctorPerformance[];
};

const defaultStats: AdminStats = {
  totalPatients: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  totalPayments: 0,
  totalRevenue: 0,
  totalReviews: 0,
};

const defaultAnalytics: AdminAnalytics = {
  platformSummary: [],
  appointmentStatusData: [],
  doctorPerformance: [],
};

const chartColors = ["#0f766e", "#2563eb", "#7c3aed", "#f59e0b", "#ef4444"];

function getStoredToken(token: string | null) {
  if (token) return token;

  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("medicare_token") ||
    localStorage.getItem("token") ||
    null
  );
}

export default function AdminDashboardPage() {
  const { user, token, loading } = useAuth();

  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(defaultAnalytics);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      setError("");

      const savedToken = getStoredToken(token);

      if (!savedToken) {
        setError("No login token found. Please login again.");
        return;
      }

      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }),
        fetch(`${API_BASE_URL}/admin/analytics`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }),
      ]);

      const statsData = await statsRes.json();
      const analyticsData = await analyticsRes.json();

      if (!statsRes.ok) {
        throw new Error(statsData.message || "Failed to fetch admin stats");
      }

      if (!analyticsRes.ok) {
        throw new Error(
          analyticsData.message || "Failed to fetch admin analytics"
        );
      }

      setStats(statsData.stats || defaultStats);
      setAnalytics(analyticsData.analytics || defaultAnalytics);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      fetchDashboardData();
    }
  }, [loading, user?.role]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />

          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Loading Dashboard
          </h2>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <ShieldCheck className="mx-auto h-14 w-14 text-red-500 dark:text-red-400" />

          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            Unauthorized Access
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            This page is only for admin users.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      subtitle: "Registered patient accounts",
      icon: Users,
    },
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      subtitle: "Doctors in the system",
      icon: Stethoscope,
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      subtitle: "Total valid appointment records",
      icon: CalendarDays,
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue}`,
      subtitle: `${stats.totalPayments} successful payments`,
      icon: CreditCard,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Admin Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Welcome, {user.name}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Manage users, verify doctors, monitor appointments, review
              payments, and analyze platform performance.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={dataLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3 font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <RefreshCw
              className={`h-5 w-5 ${dataLoading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Icon className="h-7 w-7" />
                </div>

                <p className="mt-8 font-bold text-slate-600 dark:text-slate-300">
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

        {/* MANAGEMENT CARDS */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <ManagementCard
            title="Manage Users"
            description="View users, suspend accounts, activate accounts, or delete users."
            href="/dashboard/admin/users"
            buttonText="Open Users"
            icon={<Users className="h-7 w-7" />}
            buttonClass="border border-slate-200 bg-slate-50 text-slate-900 hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10"
          />

          <ManagementCard
            title="Manage Doctors"
            description="Verify doctors, reject invalid profiles, or cancel doctor verification."
            href="/dashboard/admin/doctors"
            buttonText="Open Doctors"
            icon={<ShieldCheck className="h-7 w-7" />}
            buttonClass="bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
          />

          <ManagementCard
            title="Manage Appointments"
            description="View all appointments and monitor patient, doctor, payment, and appointment status."
            href="/dashboard/admin/appointments"
            buttonText="Open Appointments"
            icon={<CalendarDays className="h-7 w-7" />}
            buttonClass="border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20"
          />

          <ManagementCard
            title="Manage Payments"
            description="View Stripe payment records, transaction IDs, revenue, and paid appointment details."
            href="/dashboard/admin/payments"
            buttonText="Open Payments"
            icon={<CreditCard className="h-7 w-7" />}
            iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
            buttonClass="border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
          />
        </div>

        {/* RECHARTS ANALYTICS */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
              <BarChart3 className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                Analytics Dashboard
              </h2>

              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Recharts-based analytics for platform summary, appointment
                status, and doctor performance.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {/* PLATFORM SUMMARY */}
            <ChartCard
              title="Platform Summary"
              description="Total patients, doctors, appointments, and reviews."
            >
              {analytics.platformSummary.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={analytics.platformSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Total"
                      radius={[10, 10, 0, 0]}
                      fill="#0f766e"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* APPOINTMENT STATUS */}
            <ChartCard
              title="Appointment Status"
              description="Pending, accepted, completed, and rejected appointments."
            >
              {analytics.appointmentStatusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={analytics.appointmentStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label
                    >
                      {analytics.appointmentStatusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* DOCTOR PERFORMANCE */}
          <div className="mt-6">
            <ChartCard
              title="Doctor Performance by Rating"
              description="Top doctors ranked by average patient rating."
            >
              {analytics.doctorPerformance.length === 0 ? (
                <EmptyChart text="No doctor rating data found. Add patient reviews to show doctor performance." />
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={analytics.doctorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="doctorName"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="averageRating"
                      name="Average Rating"
                      fill="#2563eb"
                      radius={[10, 10, 0, 0]}
                    />
                    <Bar
                      dataKey="totalReviews"
                      name="Total Reviews"
                      fill="#0f766e"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function ManagementCard({
  title,
  description,
  href,
  buttonText,
  icon,
  iconClass = "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300",
  buttonClass,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon: React.ReactNode;
  iconClass?: string;
  buttonClass: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            {title}
          </h2>

          <p className="mt-3 min-h-[84px] leading-7 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className={`mt-7 flex items-center justify-between rounded-2xl px-5 py-4 font-black transition ${buttonClass}`}
      >
        {buttonText}
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-2xl font-black text-slate-950 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>

      <div className="mt-6 h-[340px] rounded-2xl bg-white p-4 dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}

function EmptyChart({
  text = "No chart data found.",
}: {
  text?: string;
}) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
      {text}
    </div>
  );
}