"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import ProtectedRoute from "@/components/providers/ProtectedRoute";

type UserType = {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  photo?: string;
  phone?: string;
  gender?: string;
  status?: "active" | "suspended";
  createdAt?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (id: string) => {
    try {
      setActionLoading(id);

      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/users/${id}/suspend`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to suspend user");
      }

      await fetchUsers();
      alert("User suspended successfully");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const activateUser = async (id: string) => {
    try {
      setActionLoading(id);

      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/users/${id}/activate`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to activate user");
      }

      await fetchUsers();
      alert("User activated successfully");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) return;

    try {
      setActionLoading(id);

      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      await fetchUsers();
      alert("User deleted successfully");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <section className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                <ArrowLeft size={17} />
                Back to Admin Dashboard
              </Link>

              <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                Admin Panel
              </p>

              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Manage Users
              </h1>

              <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-300">
                View registered users, suspend accounts, activate accounts, or
                delete users from the system.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                <Users size={22} />
              </div>

              <div>
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
                  {users.length}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Total Users
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600" />
                <p className="mt-4 font-bold text-slate-600 dark:text-slate-300">
                  Loading users...
                </p>
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-bold">Error</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* USERS TABLE */}
          {!loading && !error && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        {/* USER */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {user.photo ? (
                              <img
                                src={user.photo}
                                alt={user.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-lg font-extrabold text-white">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}

                            <div>
                              <p className="font-extrabold text-slate-950 dark:text-white">
                                {user.name}
                              </p>

                              <p className="text-xs font-medium text-slate-500">
                                Joined:{" "}
                                {user.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                              <Mail size={15} />
                              {user.email}
                            </p>

                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                              <Phone size={15} />
                              {user.phone || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                                : user.role === "doctor"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                : "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                            }`}
                          >
                            <Shield size={14} />
                            {user.role}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                              user.status === "suspended"
                                ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                : "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                            }`}
                          >
                            {user.status || "active"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            {user.status === "suspended" ? (
                              <button
                                onClick={() => activateUser(user._id)}
                                disabled={actionLoading === user._id}
                                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-green-700 disabled:opacity-60"
                              >
                                <UserCheck size={15} />
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => suspendUser(user._id)}
                                disabled={actionLoading === user._id}
                                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-yellow-600 disabled:opacity-60"
                              >
                                <UserX size={15} />
                                Suspend
                              </button>
                            )}

                            <button
                              onClick={() => deleteUser(user._id)}
                              disabled={
                                user.role === "admin" ||
                                actionLoading === user._id
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-16 text-center text-sm font-bold text-slate-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}