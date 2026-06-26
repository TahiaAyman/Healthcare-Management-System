"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Check,
  ClipboardList,
  FileText,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";

import ProtectedRoute from "@/components/providers/ProtectedRoute";
import {
  doctorDashboardAPI,
  type DoctorAppointment,
} from "@/services/api";

export default function DoctorAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const data = await doctorDashboardAPI.getAppointments();

      setAppointments(data || []);
    } catch (error: any) {
      alert(error.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    appointmentId: string,
    status: "accepted" | "rejected" | "completed"
  ) => {
    try {
      setUpdatingId(appointmentId);

      await doctorDashboardAPI.updateAppointmentStatus(appointmentId, status);

      alert(`Appointment ${status} successfully`);

      await fetchAppointments();

      if (status === "completed") {
        router.push(
          `/dashboard/doctor/prescriptions?appointmentId=${appointmentId}`
        );
      }
    } catch (error: any) {
      alert(error.message || "Failed to update appointment");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusClass = (status: string) => {
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

  const totalPending = appointments.filter(
    (item) => item.appointmentStatus === "pending"
  ).length;

  const totalAccepted = appointments.filter(
    (item) => item.appointmentStatus === "accepted"
  ).length;

  const totalCompleted = appointments.filter(
    (item) => item.appointmentStatus === "completed"
  ).length;

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <section className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                Doctor Appointments
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
                Appointment Requests
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Accept, reject, or complete patient appointment requests.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAppointments}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* STATS */}
          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <SummaryCard
              title="Pending Requests"
              value={totalPending}
              icon={<ClipboardList size={22} />}
            />

            <SummaryCard
              title="Accepted"
              value={totalAccepted}
              icon={<CalendarCheck size={22} />}
            />

            <SummaryCard
              title="Completed"
              value={totalCompleted}
              icon={<Check size={22} />}
            />
          </div>

          {/* APPOINTMENT TABLE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                  All Appointment Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Paid appointments can be accepted. Completed appointments can
                  move to prescription management.
                </p>
              </div>

              <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-xs font-extrabold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                Total: {appointments.length}
              </span>
            </div>

            {loading ? (
              <div className="animate-pulse rounded-2xl bg-slate-100 p-8 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Loading appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                <ClipboardList className="mx-auto h-12 w-12 text-teal-600 dark:text-teal-400" />

                <h3 className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">
                  No appointment request found
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Appointment requests will appear here after patients book this
                  doctor.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-3">Patient</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Time</th>
                      <th className="py-3">Symptoms</th>
                      <th className="py-3">Payment</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appointment) => {
                      const isUpdating = updatingId === appointment._id;
                      const patient = appointment.patientId;

                      return (
                        <tr
                          key={appointment._id}
                          className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {patient?.photo ? (
                                <img
                                  src={patient.photo}
                                  alt={patient.name || "Patient"}
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                                  <UserRound size={22} />
                                </div>
                              )}

                              <div>
                                <p className="font-extrabold text-slate-950 dark:text-white">
                                  {patient?.name || "Patient"}
                                </p>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {patient?.email || "-"}
                                </p>

                                {patient?.phone && (
                                  <p className="text-xs text-slate-400 dark:text-slate-500">
                                    {patient.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {appointment.appointmentDate}
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {appointment.appointmentTime}
                          </td>

                          <td className="max-w-[260px] py-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {appointment.symptoms || "-"}
                          </td>

                          <td className="py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                                appointment.paymentStatus === "paid"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                              }`}
                            >
                              {appointment.paymentStatus}
                            </span>
                          </td>

                          <td className="py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${getStatusClass(
                                appointment.appointmentStatus
                              )}`}
                            >
                              {appointment.appointmentStatus}
                            </span>
                          </td>

                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              {appointment.appointmentStatus === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      isUpdating ||
                                      appointment.paymentStatus !== "paid"
                                    }
                                    onClick={() =>
                                      updateStatus(
                                        appointment._id,
                                        "accepted"
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500/10 dark:text-blue-300"
                                    title={
                                      appointment.paymentStatus !== "paid"
                                        ? "Patient must pay first"
                                        : "Accept appointment"
                                    }
                                  >
                                    <Check size={15} />
                                    Accept
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      updateStatus(
                                        appointment._id,
                                        "rejected"
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/10 dark:text-red-300"
                                  >
                                    <X size={15} />
                                    Reject
                                  </button>
                                </>
                              )}

                              {appointment.appointmentStatus === "accepted" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    updateStatus(
                                      appointment._id,
                                      "completed"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-300"
                                >
                                  <Check size={15} />
                                  Complete
                                </button>
                              )}

                              {appointment.appointmentStatus ===
                                "completed" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/doctor/prescriptions?appointmentId=${appointment._id}`
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-xl bg-purple-50 px-3 py-2 text-xs font-extrabold text-purple-700 transition hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-300"
                                >
                                  <FileText size={15} />
                                  Prescription
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </ProtectedRoute>
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-bold text-slate-500 dark:text-slate-300">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}