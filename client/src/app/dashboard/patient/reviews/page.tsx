"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Star,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Doctor = {
  _id: string;
  doctorName?: string;
  name?: string;
  specialization?: string;
  profileImage?: string;
  image?: string;
  hospitalName?: string;
  verificationStatus?: string;
};

type Review = {
  _id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  doctorId?: {
    _id: string;
    doctorName?: string;
    name?: string;
    specialization?: string;
    profileImage?: string;
    image?: string;
    hospitalName?: string;
  };
};

export default function PatientReviewsPage() {
  const { user, token, loading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({
    doctorId: "",
    rating: 5,
    reviewText: "",
  });

  const getSavedToken = () => {
    return (
      token ||
      localStorage.getItem("medicare_token") ||
      localStorage.getItem("token")
    );
  };

  const verifiedDoctors = useMemo(() => {
    return doctors.filter(
      (doctor) =>
        !doctor.verificationStatus || doctor.verificationStatus === "verified"
    );
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch doctors");
      }

      setDoctors(data.doctors || []);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const fetchReviews = async () => {
    try {
      setDataLoading(true);
      setError("");

      const savedToken = getSavedToken();

      if (!savedToken) {
        setError("Login token missing. Please login again.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/reviews/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setReviews(data.reviews || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    document.title = "My Reviews | MediCare Connect";

    if (!loading && user?.role === "patient") {
      fetchDoctors();
      fetchReviews();
    }
  }, [loading, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !form.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    if (!form.reviewText.trim()) {
      alert("Please write your review.");
      return;
    }

    try {
      setActionLoading(editingId || "create");

      const savedToken = getSavedToken();

      if (!savedToken) {
        alert("Login token missing. Please login again.");
        return;
      }

      const endpoint = editingId
        ? `${API_BASE_URL}/reviews/my/${editingId}`
        : `${API_BASE_URL}/reviews`;

      const method = editingId ? "PATCH" : "POST";

      const body = editingId
        ? {
            rating: Number(form.rating),
            reviewText: form.reviewText,
          }
        : {
            doctorId: form.doctorId,
            rating: Number(form.rating),
            reviewText: form.reviewText,
          };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save review");
      }

      alert(
        editingId ? "Review updated successfully" : "Review added successfully"
      );

      setEditingId("");
      setForm({
        doctorId: "",
        rating: 5,
        reviewText: "",
      });

      fetchReviews();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading("");
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review._id);
    setForm({
      doctorId: review.doctorId?._id || "",
      rating: review.rating,
      reviewText: review.reviewText,
    });
  };

  const handleDelete = async (reviewId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(reviewId);

      const savedToken = getSavedToken();

      const res = await fetch(`${API_BASE_URL}/reviews/my/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete review");
      }

      alert("Review deleted successfully");
      fetchReviews();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading("");
    }
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm({
      doctorId: "",
      rating: 5,
      reviewText: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
          <ShieldAlert className="mx-auto h-14 w-14 text-red-500 dark:text-red-300" />

          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            Unauthorized Access
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            This page is only for patient users.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
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
              My Reviews
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              Add, update, or delete doctor reviews using real MongoDB review
              records.
            </p>
          </div>

          <button
            onClick={fetchReviews}
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

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Plus size={24} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                    {editingId ? "Update Review" : "Add Review"}
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Patient review CRUD module.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                    Select Doctor
                  </label>

                  <select
                    value={form.doctorId}
                    onChange={(e) =>
                      setForm({ ...form, doctorId: e.target.value })
                    }
                    disabled={Boolean(editingId)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:disabled:bg-slate-800"
                    required={!editingId}
                  >
                    <option value="">Choose a doctor</option>

                    {verifiedDoctors.map((doctor) => {
                      const doctorName =
                        doctor.doctorName || doctor.name || "Doctor";

                      return (
                        <option key={doctor._id} value={doctor._id}>
                          {doctorName} — {doctor.specialization || "Specialist"}
                        </option>
                      );
                    })}
                  </select>

                  {editingId && (
                    <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Doctor cannot be changed while updating a review.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                    Rating
                  </label>

                  <select
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: Number(e.target.value) })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-950 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Bad</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300">
                    Review Text
                  </label>

                  <textarea
                    rows={5}
                    value={form.reviewText}
                    onChange={(e) =>
                      setForm({ ...form, reviewText: e.target.value })
                    }
                    placeholder="Write your review..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={Boolean(actionLoading)}
                  className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 font-black text-white shadow-md transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading
                    ? "Processing..."
                    : editingId
                    ? "Update Review"
                    : "Add Review"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                    Review Records
                  </h2>

                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Total Reviews:{" "}
                    <span className="font-black text-teal-600 dark:text-teal-300">
                      {reviews.length}
                    </span>
                  </p>
                </div>
              </div>

              {dataLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-300" />
                  <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                    Loading reviews...
                  </h3>
                </div>
              ) : reviews.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <Star className="mx-auto h-14 w-14 text-slate-300 dark:text-slate-600" />

                  <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                    No reviews yet
                  </h3>

                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Add your first doctor review from the form.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {reviews.map((review) => {
                    const doctor = review.doctorId;
                    const doctorName =
                      doctor?.doctorName || doctor?.name || "Doctor";

                    return (
                      <div
                        key={review._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                          <div className="flex gap-4">
                            <DoctorAvatar
                              doctorName={doctorName}
                              imageSrc={doctor?.profileImage || doctor?.image || ""}
                            />

                            <div>
                              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                                {doctorName}
                              </h3>

                              <p className="font-bold text-teal-600 dark:text-teal-300">
                                {doctor?.specialization || "Specialist"}
                              </p>

                              <p className="mt-2 font-bold text-yellow-500">
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                              </p>

                              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">
                                {review.reviewText}
                              </p>

                              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Created:{" "}
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => handleEdit(review)}
                              disabled={Boolean(actionLoading)}
                              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
                            >
                              <Edit size={16} />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(review._id)}
                              disabled={actionLoading === review._id}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                              <Trash2 size={16} />
                              {actionLoading === review._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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