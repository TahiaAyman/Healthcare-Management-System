"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  RefreshCw,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type PatientInfo = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  gender?: string;
};

type DoctorInfo = {
  _id: string;
  doctorName: string;
  specialization: string;
  consultationFee: number;
  hospitalName?: string;
  profileImage?: string;
};

type AdminAppointment = {
  _id: string;
  patientId: PatientInfo | null;
  doctorId: DoctorInfo | null;
  appointmentDate: string;
  appointmentTime: string;
  symptoms?: string;
  appointmentStatus:
    | "pending"
    | "accepted"
    | "rejected"
    | "completed"
    | "cancelled";
  paymentStatus: "unpaid" | "paid";
  createdAt?: string;
};

export default function AdminAppointmentsPage() {
  const { user, token, loading } = useAuth();

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
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

      const res = await fetch(
        "http://localhost:5000/api/admin/appointments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load appointments");
      }

      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      fetchAppointments();
    }
  }, [loading, user?.role]);

  const getAppointmentStatusClass = (status: string) => {
    if (status === "accepted") {
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
    }

    if (status === "completed") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    }

    if (status === "cancelled") {
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }

    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300";
  };

  const getPaymentStatusClass = (status: string) => {
    if (status === "paid") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    }

    return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />
          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Loading Appointments
          </h2>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Unauthorized Access
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            This page is only for admin users.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
            >
              <ArrowLeft size={18} />
              Back to Admin Dashboard
            </Link>

            <p className="text-sm font-black uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Manage Appointments
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Monitor all patient appointment records, doctor information,
              appointment status, and payment status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAppointments}
            disabled={dataLoading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3 font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <RefreshCw
              className={`h-5 w-5 ${dataLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* SUMMARY */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            title="Total Appointments"
            value={appointments.length}
            icon={<CalendarDays size={24} />}
          />

          <SummaryCard
            title="Paid Appointments"
            value={
              appointments.filter((item) => item.paymentStatus === "paid")
                .length
            }
            icon={<CreditCard size={24} />}
          />

          <SummaryCard
            title="Completed"
            value={
              appointments.filter(
                (item) => item.appointmentStatus === "completed"
              ).length
            }
            icon={<Stethoscope size={24} />}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {/* TABLE */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                All Appointment Records
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                View which patient booked which doctor and monitor current
                status.
              </p>
            </div>

            <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-xs font-black text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              Total: {appointments.length}
            </span>
          </div>

          {dataLoading ? (
            <div className="animate-pulse rounded-2xl bg-slate-100 p-8 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
              <CalendarDays className="mx-auto h-12 w-12 text-teal-600 dark:text-teal-400" />

              <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                No appointments found
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Appointment records will appear here after patients book doctors.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    <th className="py-4">Patient</th>
                    <th className="py-4">Doctor</th>
                    <th className="py-4">Date</th>
                    <th className="py-4">Time</th>
                    <th className="py-4">Symptoms</th>
                    <th className="py-4">Appointment</th>
                    <th className="py-4">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => {
                    const patient = appointment.patientId;
                    const doctor = appointment.doctorId;

                    return (
                      <tr
                        key={appointment._id}
                        className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800"
                      >
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            {patient?.photo ? (
                              <img
                                src={patient.photo}
                                alt={patient.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                                <UserRound size={22} />
                              </div>
                            )}

                            <div>
                              <p className="font-black text-slate-950 dark:text-white">
                                {patient?.name || "Unknown Patient"}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {patient?.email || "-"}
                              </p>

                              {patient?.phone && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {patient.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            {doctor?.profileImage ? (
                              <img
                                src={doctor.profileImage}
                                alt={doctor.doctorName}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                <Stethoscope size={22} />
                              </div>
                            )}

                            <div>
                              <p className="font-black text-slate-950 dark:text-white">
                                {doctor?.doctorName || "Unknown Doctor"}
                              </p>

                              <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                                {doctor?.specialization || "-"}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Fee: ${doctor?.consultationFee || 0}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                          {appointment.appointmentDate}
                        </td>

                        <td className="py-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                          {appointment.appointmentTime}
                        </td>

                        <td className="max-w-[260px] py-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {appointment.symptoms || "-"}
                        </td>

                        <td className="py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black capitalize ${getAppointmentStatusClass(
                              appointment.appointmentStatus
                            )}`}
                          >
                            {appointment.appointmentStatus}
                          </span>
                        </td>

                        <td className="py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black capitalize ${getPaymentStatusClass(
                              appointment.paymentStatus
                            )}`}
                          >
                            {appointment.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
        {icon}
      </div>

      <h3 className="mt-6 text-sm font-bold text-slate-600 dark:text-slate-300">
        {title}
      </h3>

      <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}