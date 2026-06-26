"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  patientPrescriptionAPI,
  type PatientPrescription,
} from "@/services/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Appointment = {
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

export default function PatientAppointmentsPage() {
  const { user, token, loading } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
  });

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");
  const [selectedPrescription, setSelectedPrescription] =
    useState<PatientPrescription | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const getSavedToken = () => {
    return (
      token ||
      localStorage.getItem("medicare_token") ||
      localStorage.getItem("token")
    );
  };

  const fetchAppointments = async () => {
    try {
      setDataLoading(true);
      setError("");

      const savedToken = getSavedToken();

      if (!savedToken) {
        setError("Login token missing. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/appointments/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch appointments");
      }

      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    document.title = "My Appointments | MediCare Connect";

    if (!loading && user?.role === "patient") {
      fetchAppointments();
    }
  }, [loading, user?.role]);

  const handleViewPrescription = async (appointmentId: string) => {
    try {
      setPrescriptionOpen(true);
      setPrescriptionLoading(true);
      setPrescriptionError("");
      setSelectedPrescription(null);

      const data = await patientPrescriptionAPI.getByAppointment(appointmentId);

      setSelectedPrescription(data.prescription);
    } catch (err: any) {
      setPrescriptionError(err.message || "Prescription not found");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      setActionLoading(appointmentId);

      const savedToken = getSavedToken();

      const res = await fetch(
        `${API_BASE_URL}/appointments/my/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      alert("Appointment cancelled successfully");
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteHistory = async (appointmentId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cancelled appointment history?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(appointmentId);

      const savedToken = getSavedToken();

      const res = await fetch(`${API_BASE_URL}/appointments/my/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete appointment history");
      }

      alert("Cancelled appointment history deleted successfully");
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading("");
    }
  };

  const startReschedule = (appointment: Appointment) => {
    setEditingId(appointment._id);
    setEditForm({
      appointmentDate: appointment.appointmentDate?.slice(0, 10) || "",
      appointmentTime: appointment.appointmentTime || "",
    });
  };

  const handleRescheduleAppointment = async (appointmentId: string) => {
    if (!editForm.appointmentDate || !editForm.appointmentTime) {
      alert("Please select date and time.");
      return;
    }

    try {
      setActionLoading(appointmentId);

      const savedToken = getSavedToken();

      const res = await fetch(
        `${API_BASE_URL}/appointments/my/${appointmentId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${savedToken}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reschedule appointment");
      }

      alert("Appointment rescheduled successfully");

      setEditingId("");
      setEditForm({
        appointmentDate: "",
        appointmentTime: "",
      });

      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-3xl border bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm dark:border-red-500/30 dark:bg-slate-900">
          <ShieldAlert className="mx-auto h-14 w-14 text-red-500" />
          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            Unauthorized Access
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-300">
            This page is only for patient users.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/patient"
          className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
        >
          <ArrowLeft size={18} />
          Back to Patient Dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase tracking-wide text-teal-600 dark:text-teal-300">
              Patient Panel
            </p>

            <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              My Appointments
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              View your appointments, reschedule pending appointments, cancel
              appointments, view prescriptions, or delete cancelled appointment
              history.
            </p>
          </div>

          <button
            onClick={fetchAppointments}
            disabled={dataLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3 font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <RefreshCw
              className={`h-5 w-5 ${dataLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {dataLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
              <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                Loading appointments...
              </h2>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-20 text-center">
              <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
              <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                No appointments found
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-300">
                You have not booked any appointment yet.
              </p>

              <Link
                href="/doctors"
                className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white"
              >
                Find Doctors
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {appointments.map((appointment) => {
                const doctor = appointment.doctorId;
                const status = appointment.appointmentStatus;
                const isCancelled = status === "cancelled";
                const isCompleted = status === "completed";
                const isDisabled = isCancelled || isCompleted;

                return (
                  <div
                    key={appointment._id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-4">
                          <DoctorAvatar
                            doctorName={doctor?.doctorName || "Doctor"}
                            imageSrc={doctor?.profileImage || ""}
                          />

                          <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                              Doctor
                            </p>
                            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                              {doctor?.doctorName || "Doctor"}
                            </h3>
                            <p className="font-bold text-teal-600 dark:text-teal-300">
                              {doctor?.specialization || "Specialist"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                          <CalendarDays size={16} />
                          Date
                        </p>
                        <p className="mt-2 font-black text-slate-950 dark:text-white">
                          {appointment.appointmentDate?.slice(0, 10)}
                        </p>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                          <Clock size={16} />
                          Time
                        </p>
                        <p className="mt-2 font-black text-slate-950 dark:text-white">
                          {appointment.appointmentTime}
                        </p>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Status
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${
                            status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                              : status === "cancelled" || status === "rejected"
                              ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                              : status === "accepted"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="lg:col-span-2">
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

                    {appointment.symptoms && (
                      <div className="mt-5 rounded-2xl bg-white p-4 dark:bg-slate-900">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Symptoms / Notes
                        </p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">
                          {appointment.symptoms}
                        </p>
                      </div>
                    )}

                    {editingId === appointment._id && (
                      <div className="mt-5 grid gap-4 rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-500/30 dark:bg-slate-900 md:grid-cols-3">
                        <input
                          type="date"
                          min={today}
                          value={editForm.appointmentDate}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              appointmentDate: e.target.value,
                            })
                          }
                          className="rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:[color-scheme:dark]"
                        />

                        <input
                          type="text"
                          placeholder="Example: 10:00 AM"
                          value={editForm.appointmentTime}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              appointmentTime: e.target.value,
                            })
                          }
                          className="rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleRescheduleAppointment(appointment._id)
                            }
                            disabled={actionLoading === appointment._id}
                            className="flex-1 rounded-xl bg-teal-600 px-4 py-3 font-bold text-white disabled:opacity-60"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => setEditingId("")}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => startReschedule(appointment)}
                        disabled={isDisabled}
                        className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={isDisabled || actionLoading === appointment._id}
                        className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {actionLoading === appointment._id
                          ? "Processing..."
                          : "Cancel Appointment"}
                      </button>

                      {isCompleted && (
                        <button
                          onClick={() =>
                            handleViewPrescription(appointment._id)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                          <FileText size={18} />
                          View Prescription
                        </button>
                      )}

                      {isCancelled && (
                        <button
                          onClick={() => handleDeleteHistory(appointment._id)}
                          disabled={actionLoading === appointment._id}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Trash2 size={18} />
                          {actionLoading === appointment._id
                            ? "Deleting..."
                            : "Delete History"}
                        </button>
                      )}

                      {doctor?._id && (
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-teal-500/10"
                        >
                          <Stethoscope size={18} />
                          View Doctor
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {prescriptionOpen && (
        <PrescriptionModal
          loading={prescriptionLoading}
          error={prescriptionError}
          prescription={selectedPrescription}
          onClose={() => {
            setPrescriptionOpen(false);
            setSelectedPrescription(null);
            setPrescriptionError("");
          }}
        />
      )}
    </div>
  );
}

function DoctorAvatar({
  doctorName,
  imageSrc,
}: {
  doctorName: string;
  imageSrc: string;
}) {
  const [imageError, setImageError] = useState(false);

  const cleanImage = String(imageSrc || "").trim();
  const initial = doctorName?.charAt(0)?.toUpperCase() || "D";

  if (cleanImage && !imageError) {
    return (
      <img
        src={cleanImage}
        alt={doctorName}
        onError={() => setImageError(true)}
        className="h-20 w-20 shrink-0 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-teal-100 bg-teal-50 text-3xl font-black text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300">
      {initial}
    </div>
  );
}

function PrescriptionModal({
  loading,
  error,
  prescription,
  onClose,
}: {
  loading: boolean;
  error: string;
  prescription: PatientPrescription | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-black uppercase tracking-wide text-teal-600 dark:text-teal-300">
              Prescription
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              Doctor Prescription
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X size={22} />
          </button>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
              Loading prescription...
            </h3>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300">
            <h3 className="text-xl font-black">Prescription not available</h3>
            <p className="mt-2 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && prescription && (
          <div className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBlock
                title="Doctor"
                value={prescription.doctorId?.doctorName || "Doctor"}
              />

              <InfoBlock
                title="Specialization"
                value={prescription.doctorId?.specialization || "Not added"}
              />

              <InfoBlock
                title="Appointment Date"
                value={
                  prescription.appointmentId?.appointmentDate?.slice(0, 10) ||
                  "N/A"
                }
              />

              <InfoBlock
                title="Appointment Time"
                value={prescription.appointmentId?.appointmentTime || "N/A"}
              />
            </div>

            <InfoBlock
              title="Symptoms / Notes from Appointment"
              value={prescription.appointmentId?.symptoms || "Not added"}
            />

            <InfoBlock title="Diagnosis" value={prescription.diagnosis} />

            <InfoBlock title="Medications" value={prescription.medications} />

            <InfoBlock title="Doctor Notes" value={prescription.notes || "N/A"} />

            <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Created:{" "}
              {prescription.createdAt
                ? new Date(prescription.createdAt).toLocaleString()
                : "N/A"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-lg font-bold leading-8 text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}