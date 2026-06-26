"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock,
  DollarSign,
  GraduationCap,
  Loader2,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Doctor = {
  _id: string;
  doctorName?: string;
  name?: string;
  specialization?: string;
  qualifications?: string | string[];
  experience?: number | string;
  consultationFee?: number | string;
  hospitalName?: string;
  profileImage?: string;
  image?: string;
  availableDays?: string[];
  availableSlots?: string[];
  verificationStatus?: string;
  rating?: number;
  avgRating?: number;
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
};

export default function DoctorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const doctorId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const doctorName = doctor?.doctorName || doctor?.name || "Doctor";

  const doctorImage = String(doctor?.profileImage || doctor?.image || "").trim();

  const rating = Number(
    doctor?.avgRating || doctor?.averageRating || doctor?.rating || 0
  );

  const reviewCount = Number(doctor?.reviewCount || doctor?.totalReviews || 0);

  const qualificationsText = useMemo(() => {
    if (!doctor?.qualifications) return "Not added yet";

    if (Array.isArray(doctor.qualifications)) {
      return doctor.qualifications.join(", ");
    }

    return doctor.qualifications;
  }, [doctor]);

  const availableDays =
    doctor?.availableDays && doctor.availableDays.length > 0
      ? doctor.availableDays
      : ["Not added yet"];

  const availableSlots =
    doctor?.availableSlots && doctor.availableSlots.length > 0
      ? doctor.availableSlots
      : [];

  useEffect(() => {
    if (!doctorId) return;

    async function fetchDoctor() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch doctor");
        }

        setDoctor(data.doctor || data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    document.title = `${doctorName} | MediCare Connect`;
  }, [doctorName]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorId) {
      alert("Doctor ID not found.");
      return;
    }

    if (!user) {
      alert("Please login first to book an appointment.");
      router.push("/login");
      return;
    }

    if (user.role !== "patient") {
      alert("Only patient accounts can book appointments.");
      return;
    }

    if (!form.appointmentDate || !form.appointmentTime) {
      alert("Please select appointment date and time.");
      return;
    }

    try {
      setBookingLoading(true);

      const savedToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("medicare_token") ||
            localStorage.getItem("token")
          : null);

      if (!savedToken) {
        alert("Login token missing. Please login again.");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({
          doctorId,
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          symptoms: form.symptoms,
          appointmentStatus: "pending",
          paymentStatus: "unpaid",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Appointment booking failed");
      }

      alert("Appointment booked successfully!");

      setForm({
        appointmentDate: "",
        appointmentTime: "",
        symptoms: "",
      });

      router.push("/dashboard/patient");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20 dark:bg-slate-950">
        <div className="mx-auto flex max-w-3xl items-center justify-center rounded-3xl border border-slate-200 bg-white p-16 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
            <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
              Loading Doctor Details
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Fetching doctor information from database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm dark:border-red-500/30 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            Doctor Not Found
          </h2>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {error || "This doctor profile could not be loaded."}
          </p>

          <Link
            href="/doctors"
            className="mt-8 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700"
          >
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-blue-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
          >
            <ArrowLeft size={18} />
            Back to Doctors
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="grid gap-8 md:grid-cols-[260px_1fr]">
                  <DoctorAvatar doctorName={doctorName} imageSrc={doctorImage} />

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h1 className="text-4xl font-black text-slate-950 dark:text-white">
                          {doctorName}
                        </h1>

                        <p className="mt-2 text-xl font-bold text-teal-700 dark:text-teal-300">
                          {doctor.specialization || "Specialization not added"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-4 py-1 text-sm font-bold capitalize ${
                          doctor.verificationStatus === "verified"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                            : doctor.verificationStatus === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300"
                        }`}
                      >
                        {doctor.verificationStatus || "pending"}
                      </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        Rating
                      </p>

                      <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                        {rating > 0
                          ? `⭐ ${rating.toFixed(1)}`
                          : "No rating yet"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {reviewCount} reviews
                      </p>
                    </div>

                    <p className="mt-6 leading-8 text-slate-700 dark:text-slate-300">
                      Book an appointment with this verified doctor through
                      MediCare Connect. Your appointment request will be saved
                      in the database and shown in your patient dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <Stethoscope size={26} />
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                      Doctor Profile
                    </p>
                    <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                      Appointment Information
                    </h2>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <InfoCard
                    icon={<GraduationCap size={22} />}
                    title="Qualifications"
                    value={qualificationsText}
                  />

                  <InfoCard
                    icon={<CalendarDays size={22} />}
                    title="Experience"
                    value={`${doctor.experience || 0} years`}
                  />

                  <InfoCard
                    icon={<DollarSign size={22} />}
                    title="Consultation Fee"
                    value={`$${doctor.consultationFee || 0}`}
                  />

                  <InfoCard
                    icon={<Building2 size={22} />}
                    title="Hospital"
                    value={doctor.hospitalName || "Not added yet"}
                  />
                </div>

                <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
                    <CalendarDays
                      className="text-teal-700 dark:text-teal-300"
                      size={22}
                    />
                    Available Days
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {availableDays.map((day) => (
                      <span
                        key={day}
                        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
                    <Clock
                      className="text-teal-700 dark:text-teal-300"
                      size={22}
                    />
                    Available Slots
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300"
                        >
                          {slot}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                        Not added yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <BadgeCheck size={26} />
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                      Patient Booking
                    </p>
                    <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                      Book Appointment
                    </h2>
                  </div>
                </div>

                {!user && (
                  <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300">
                    Please login as a patient before booking an appointment.
                  </div>
                )}

                {user && user.role !== "patient" && (
                  <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    Only patient accounts can book appointments.
                  </div>
                )}

                <form onSubmit={handleBooking} className="mt-7 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                      Appointment Date
                    </label>

                    <input
                      type="date"
                      min={today}
                      value={form.appointmentDate}
                      onChange={(e) =>
                        setForm({ ...form, appointmentDate: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:[color-scheme:dark] dark:focus:bg-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                      Appointment Time
                    </label>

                    <select
                      value={form.appointmentTime}
                      onChange={(e) =>
                        setForm({ ...form, appointmentTime: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                      required
                    >
                      <option value="">Select time slot</option>

                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                      Symptoms / Notes
                    </label>

                    <textarea
                      value={form.symptoms}
                      onChange={(e) =>
                        setForm({ ...form, symptoms: e.target.value })
                      }
                      rows={4}
                      placeholder="Write your symptoms or appointment note..."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-slate-600 dark:text-slate-300">
                        Consultation Fee
                      </p>

                      <p className="text-3xl font-black text-slate-950 dark:text-white">
                        ${doctor.consultationFee || 0}
                      </p>
                    </div>

                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      <Clock size={16} />
                      Stripe payment will be added in the payment step.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading || availableSlots.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 text-lg font-black text-white shadow-md transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <BadgeCheck size={22} />
                        Confirm Appointment
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
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

  const cleanImage = imageSrc.trim();
  const initial = doctorName.charAt(0).toUpperCase() || "D";

  if (cleanImage && !imageError) {
    return (
      <img
        src={cleanImage}
        alt={doctorName}
        onError={() => setImageError(true)}
        className="h-72 w-full rounded-3xl object-cover md:h-full"
      />
    );
  }

  return (
    <div className="flex h-72 w-full items-center justify-center rounded-3xl border-4 border-teal-100 bg-teal-50 text-7xl font-black text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 md:h-full">
      {initial}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <span className="text-teal-700 dark:text-teal-300">{icon}</span>
        <p className="font-bold">{title}</p>
      </div>

      <p className="mt-3 text-lg font-black text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}