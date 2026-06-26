"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Edit3,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  phone?: string;
  gender?: string;
  status?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const profileUser = user as ProfileUser | null;

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    photo: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !profileUser) {
      router.push("/login");
    }

    if (profileUser) {
      setEditForm({
        name: profileUser.name || "",
        phone: profileUser.phone || "",
        photo: profileUser.photo || "",
      });
    }
  }, [loading, profileUser, router]);

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileUser) return;

    const updatedUser: ProfileUser = {
      ...profileUser,
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      photo: editForm.photo.trim(),
    };

    localStorage.setItem("medicare_user", JSON.stringify(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setMessage("Profile updated successfully.");

    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50 px-6 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </section>
    );
  }

  if (!profileUser) {
    return (
      <section className="min-h-screen bg-slate-50 px-6 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Login Required
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-300">
            Please login to view your profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/60 px-6 py-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADER */}
        <div className="mb-10">
          <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
            Account Profile
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            My Profile
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            View and update your MediCare Connect profile information.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* PROFILE CARD */}
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="h-28 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600" />

              <div className="-mt-14 px-8 pb-8">
                {profileUser.photo ? (
                  <img
                    src={profileUser.photo}
                    alt={profileUser.name}
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg dark:border-slate-900"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-teal-600 text-4xl font-extrabold text-white shadow-lg dark:border-slate-900">
                    {getInitial(profileUser.name)}
                  </div>
                )}

                <h2 className="mt-5 text-2xl font-extrabold text-slate-950 dark:text-white">
                  {profileUser.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {profileUser.email}
                </p>

                <div className="mt-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-extrabold capitalize text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  {profileUser.role}
                </div>

                <div className="mt-8 space-y-3">
                  <Link
                    href="/dashboard"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                  >
                    <LayoutDashboard size={18} />
                    Go to Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8 lg:col-span-8">
            {/* DETAILS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                Account Information
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Your saved profile details.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <InfoCard
                  icon={<UserRound size={20} />}
                  label="Full Name"
                  value={profileUser.name}
                  color="teal"
                />

                <InfoCard
                  icon={<Mail size={20} />}
                  label="Email Address"
                  value={profileUser.email}
                  color="blue"
                />

                <InfoCard
                  icon={<ShieldCheck size={20} />}
                  label="Role"
                  value={profileUser.role}
                  color="cyan"
                  capitalize
                />

                <InfoCard
                  icon={<Phone size={20} />}
                  label="Phone"
                  value={profileUser.phone || "N/A"}
                  color="emerald"
                />

                <InfoCard
                  icon={<CalendarCheck size={20} />}
                  label="Account Status"
                  value={profileUser.status || "active"}
                  color="purple"
                  capitalize
                />
              </div>
            </div>

            {/* EDIT PROFILE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Edit3 size={20} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add or update your name, phone number, and profile image.
                  </p>
                </div>
              </div>

              {message && (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                  {message}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-8 grid gap-5">
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="+880 1XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Profile Image URL
                  </label>

                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      name="photo"
                      value={editForm.photo}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="https://example.com/profile.jpg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  value,
  color,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "teal" | "blue" | "cyan" | "emerald" | "purple";
  capitalize?: boolean;
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
          <p
            className={`mt-1 truncate font-extrabold text-slate-900 dark:text-white ${
              capitalize ? "capitalize" : ""
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}