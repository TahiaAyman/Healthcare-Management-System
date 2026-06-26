"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Stethoscope,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PatientInfo = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
};

type DoctorInfo = {
  _id: string;
  doctorName?: string;
  specialization?: string;
  consultationFee?: number;
};

type AppointmentInfo = {
  _id: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentStatus?: string;
  paymentStatus?: string;
  symptoms?: string;
};

type PaymentInfo = {
  _id: string;
  patientId?: PatientInfo | null;
  doctorId?: DoctorInfo | null;
  appointmentId?: AppointmentInfo | null;
  amount: number;
  currency?: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
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

function normalizePayments(data: any): PaymentInfo[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.payments)) return data.payments;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function paymentStatusClass(status: string) {
  if (status === "paid") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  if (status === "pending") {
    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

export default function AdminPaymentsPage() {
  const { user, token, loading } = useAuth();

  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setDataLoading(true);
      setError("");

      const savedToken = getToken(token);

      if (!savedToken) {
        setError("No login token found. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/payments/admin/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load payment records");
      }

      setPayments(normalizePayments(data));
    } catch (err: any) {
      setError(err.message || "Failed to load payment records");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      fetchPayments();
    }
  }, [loading, user?.role]);

  const paidPayments = payments.filter((payment) => payment.paymentStatus === "paid");

  const pendingPayments = payments.filter(
    (payment) => payment.paymentStatus === "pending"
  );

  const totalRevenue = paidPayments.reduce((sum, payment) => {
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

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <ShieldCheck className="mx-auto h-14 w-14 text-red-500" />

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
          href="/dashboard/admin"
          className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 hover:underline dark:text-teal-300"
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Payment Management
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              View all Stripe payment records, patient details, doctor details,
              transaction IDs, and payment status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPayments}
            disabled={dataLoading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3 font-bold text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <RefreshCw
              className={`h-5 w-5 ${dataLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <XCircle size={22} />
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <SummaryCard
            title="Total Records"
            value={payments.length}
            icon={<Receipt size={24} />}
          />

          <SummaryCard
            title="Paid Payments"
            value={paidPayments.length}
            icon={<CreditCard size={24} />}
          />

          <SummaryCard
            title="Pending Payments"
            value={pendingPayments.length}
            icon={<Loader2 size={24} />}
          />

          <SummaryCard
            title="Total Revenue"
            value={`$${totalRevenue}`}
            icon={<DollarSign size={24} />}
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                All Payment Records
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Successful and pending payment records from the database.
              </p>
            </div>

            <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-xs font-black text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              Total: {payments.length}
            </span>
          </div>

          {dataLoading ? (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-6 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading payment records...
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
              <Receipt className="mx-auto h-12 w-12 text-teal-600 dark:text-teal-400" />

              <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                No payment record found
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Payment records will appear here after patients complete
                payment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    <th className="py-4">Patient</th>
                    <th className="py-4">Doctor</th>
                    <th className="py-4">Appointment</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Transaction ID</th>
                    <th className="py-4">Payment Date</th>
                    <th className="py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => {
                    const patient = payment.patientId;
                    const doctor = payment.doctorId;
                    const appointment = payment.appointmentId;

                    return (
                      <tr
                        key={payment._id}
                        className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800"
                      >
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            {patient?.photo ? (
                              <img
                                src={patient.photo}
                                alt={patient.name || "Patient"}
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
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                              <Stethoscope size={22} />
                            </div>

                            <div>
                              <p className="font-black text-slate-950 dark:text-white">
                                {doctor?.doctorName || "Unknown Doctor"}
                              </p>

                              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                                {doctor?.specialization || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 text-sm text-slate-600 dark:text-slate-300">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {appointment?.appointmentDate || "-"}
                          </p>

                          <p>{appointment?.appointmentTime || "-"}</p>

                          <p className="mt-1 capitalize">
                            Appointment: {appointment?.appointmentStatus || "-"}
                          </p>
                        </td>

                        <td className="py-5">
                          <p className="text-lg font-black text-slate-950 dark:text-white">
                            ${payment.amount || 0}
                          </p>

                          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                            {payment.currency || "usd"}
                          </p>
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
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black capitalize ${paymentStatusClass(
                              payment.paymentStatus
                            )}`}
                          >
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
  icon: ReactNode;
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