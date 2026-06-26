"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Receipt,
  RefreshCw,
  Stethoscope,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type DoctorInfo = {
  _id: string;
  doctorName?: string;
  name?: string;
  specialization?: string;
  consultationFee?: number;
  hospitalName?: string;
  profileImage?: string;
};

type AppointmentInfo = {
  _id: string;
  doctorId?: DoctorInfo | null;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentStatus?: string;
  paymentStatus?: string;
  symptoms?: string;
};

type PaymentInfo = {
  _id: string;
  appointmentId?: AppointmentInfo | null;
  doctorId?: DoctorInfo | null;
  amount: number;
  currency?: string;
  paymentStatus: string;
  transactionId?: string;
  stripeSessionId?: string;
  paymentDate?: string;
  createdAt?: string;
};

function getToken(token: string | null) {
  if (token) return token;

  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("medicare_token") ||
    localStorage.getItem("token") ||
    null
  );
}

function normalizeAppointments(data: any): AppointmentInfo[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.appointments)) return data.appointments;
  if (Array.isArray(data?.myAppointments)) return data.myAppointments;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function normalizePayments(data: any): PaymentInfo[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.payments)) return data.payments;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getDoctorName(doctor?: DoctorInfo | null) {
  return doctor?.doctorName || doctor?.name || "Doctor";
}

export default function PatientPaymentsPage() {
  const { user, token, loading } = useAuth();
  const searchParams = useSearchParams();

  const verifiedOnce = useRef(false);

  const [appointments, setAppointments] = useState<AppointmentInfo[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [payingId, setPayingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPaymentData = async () => {
    try {
      setDataLoading(true);
      setError("");

      const savedToken = getToken(token);

      if (!savedToken) {
        setError("No login token found. Please login again.");
        return;
      }

      const [appointmentRes, paymentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/appointments/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }),
        fetch(`${API_BASE_URL}/payments/my-payments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }),
      ]);

      const appointmentData = await appointmentRes.json();
      const paymentData = await paymentRes.json();

      if (!appointmentRes.ok) {
        throw new Error(
          appointmentData.message || "Failed to load appointments"
        );
      }

      if (!paymentRes.ok) {
        throw new Error(paymentData.message || "Failed to load payments");
      }

      setAppointments(normalizeAppointments(appointmentData));
      setPayments(normalizePayments(paymentData));
    } catch (err: any) {
      setError(err.message || "Failed to load payment data");
    } finally {
      setDataLoading(false);
    }
  };

  const verifyStripeSession = async (sessionId: string) => {
    try {
      setMessage("");
      setError("");

      const savedToken = getToken(token);

      if (!savedToken) {
        setError("No login token found. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/payments/verify-session`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      setMessage("Payment completed successfully.");
      await fetchPaymentData();

      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/dashboard/patient/payments");
      }
    } catch (err: any) {
      setError(err.message || "Payment verification failed");
    }
  };

  const handlePayment = async (appointmentId: string) => {
    try {
      setPayingId(appointmentId);
      setError("");
      setMessage("");

      const savedToken = getToken(token);

      if (!savedToken) {
        setError("No login token found. Please login again.");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${savedToken}`,
          },
          body: JSON.stringify({ appointmentId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create payment session");
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL not found");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setPayingId("");
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "patient") {
      fetchPaymentData();
    }
  }, [loading, user?.role]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (
      !loading &&
      user?.role === "patient" &&
      sessionId &&
      !verifiedOnce.current
    ) {
      verifiedOnce.current = true;
      verifyStripeSession(sessionId);
    }
  }, [loading, user?.role, searchParams]);

  const unpaidAppointments = appointments.filter((appointment) => {
    return (
      appointment.paymentStatus !== "paid" &&
      appointment.appointmentStatus !== "cancelled" &&
      appointment.appointmentStatus !== "rejected"
    );
  });

  const paidPayments = payments.filter(
    (payment) => payment.paymentStatus === "paid"
  );

  const totalPaidAmount = paidPayments.reduce((sum, payment) => {
    return sum + Number(payment.amount || 0);
  }, 0);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />

          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
            Loading Payments
          </h2>
        </div>
      </main>
    );
  }

  if (!user || user.role !== "patient") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <XCircle className="mx-auto h-14 w-14 text-red-500" />

          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            Unauthorized Access
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            This page is only for patient users.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/patient"
          className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 hover:underline dark:text-teal-300"
        >
          <ArrowLeft size={18} />
          Back to Patient Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Patient Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Payment History
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Pay consultation fees securely through Stripe and view all paid
              transaction records.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPaymentData}
            disabled={dataLoading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3 font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <RefreshCw
              className={`h-5 w-5 ${dataLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={22} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <XCircle size={22} />
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            title="Paid Appointments"
            value={paidPayments.length}
            icon={<CheckCircle2 size={24} />}
          />

          <SummaryCard
            title="Pending Payments"
            value={unpaidAppointments.length}
            icon={<CreditCard size={24} />}
          />

          <SummaryCard
            title="Total Paid Amount"
            value={`$${totalPaidAmount}`}
            icon={<Receipt size={24} />}
          />
        </div>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Pending Payments
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Complete payment for unpaid appointments.
            </p>
          </div>

          {dataLoading ? (
            <LoadingBox text="Loading pending payments..." />
          ) : unpaidAppointments.length === 0 ? (
            <EmptyBox text="No pending payment found." />
          ) : (
            <div className="space-y-4">
              {unpaidAppointments.map((appointment) => {
                const doctor = appointment.doctorId;
                const fee = Number(doctor?.consultationFee || 0);

                return (
                  <div
                    key={appointment._id}
                    className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[1fr_180px]"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                        <Stethoscope size={28} />
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-950 dark:text-white">
                          {getDoctorName(doctor)}
                        </h3>

                        <p className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-300">
                          {doctor?.specialization || "Specialization not added"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} />
                            {appointment.appointmentDate || "-"}
                          </span>

                          <span>{appointment.appointmentTime || "-"}</span>

                          <span className="font-bold capitalize">
                            Status: {appointment.appointmentStatus || "pending"}
                          </span>
                        </div>

                        {appointment.symptoms && (
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            Symptoms: {appointment.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl bg-white p-4 dark:bg-slate-900">
                      <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Consultation Fee
                        </p>

                        <h4 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                          ${fee}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePayment(appointment._id)}
                        disabled={payingId === appointment._id}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-3 font-black text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
                      >
                        {payingId === appointment._id ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Pay Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Paid Transaction Records
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Successful Stripe payment records are listed here.
            </p>
          </div>

          {dataLoading ? (
            <LoadingBox text="Loading payment history..." />
          ) : paidPayments.length === 0 ? (
            <EmptyBox text="No paid transaction record found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    <th className="py-4">Doctor</th>
                    <th className="py-4">Appointment</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Transaction ID</th>
                    <th className="py-4">Payment Date</th>
                    <th className="py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {paidPayments.map((payment) => {
                    const doctor = payment.doctorId;
                    const appointment = payment.appointmentId;

                    return (
                      <tr
                        key={payment._id}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="py-5">
                          <p className="font-black text-slate-950 dark:text-white">
                            {getDoctorName(doctor)}
                          </p>

                          <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                            {doctor?.specialization || "-"}
                          </p>
                        </td>

                        <td className="py-5 text-sm text-slate-600 dark:text-slate-300">
                          <p>{appointment?.appointmentDate || "-"}</p>
                          <p>{appointment?.appointmentTime || "-"}</p>
                        </td>

                        <td className="py-5 font-black text-slate-950 dark:text-white">
                          ${payment.amount}
                        </td>

                        <td className="max-w-[260px] truncate py-5 text-sm text-slate-600 dark:text-slate-300">
                          {payment.transactionId ||
                            payment.stripeSessionId ||
                            "-"}
                        </td>

                        <td className="py-5 text-sm text-slate-600 dark:text-slate-300">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleString()
                            : "-"}
                        </td>

                        <td className="py-5">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black capitalize text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            {payment.paymentStatus}
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
  value: string | number;
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

function LoadingBox({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-6 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Loader2 className="h-5 w-5 animate-spin" />
      {text}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {text}
    </div>
  );
}