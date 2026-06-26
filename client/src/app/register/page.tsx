"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  HeartPulse,
  Image as ImageIcon,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import { useAuth, type UserRole } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    photo: "",
    password: "",
    role: "patient" as UserRole,
  });

  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleAgreeToggle = () => {
    setAgree((prev) => !prev);
    setErrorMessage("");
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasMinLength && hasNumber && hasSpecialCharacter;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage("Name, email, and password are required.");
      return;
    }

    if (!validatePassword(form.password)) {
      setErrorMessage(
        "Password must be at least 6 characters and include one number and one special character."
      );
      return;
    }

    if (!agree) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        photo: form.photo.trim(),
      });

      setSuccessMessage("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 900);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-tr from-teal-50/40 via-[#f8fafc] to-blue-50/40 px-6 py-12 font-sans text-slate-950 transition-colors duration-300 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white">
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-12">
        {/* LEFT INFO PANEL */}
        <div className="hidden flex-col justify-center lg:col-span-5 lg:flex">
          <div className="mb-4 w-fit rounded-xl border border-teal-100/50 bg-teal-50 p-2 text-teal-600 shadow-sm dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
            <Activity className="h-6 w-6" />
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#0f172a] dark:text-white">
            Join{" "}
            <span className="text-teal-600 dark:text-teal-400">
              MediCare Connect
            </span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
            Create your account today and start managing healthcare appointments,
            trusted doctors, and your digital medical records in one centralized,
            secure space.
          </p>

          <div className="mt-8 space-y-3.5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Secure Authentication & Encrypted Logs
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                <CalendarDays className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Instant Doctor Appointment Booking
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Centralized Medical Record Management
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Patient and Doctor Role Support
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM CARD */}
        <div className="flex w-full justify-center lg:col-span-7 lg:justify-end">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 md:p-10">
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-teal-600 to-cyan-500" />

            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-teal-100/50 bg-teal-50 text-teal-600 shadow-sm dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300 lg:hidden">
                <UserPlus className="h-5 w-5" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[#0f172a] dark:text-white md:text-3xl">
                Create Account
              </h2>

              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-400">
                Register below to access your MediCare dashboard
              </p>
            </div>

            {successMessage && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Full Name
                </label>

                <div className="group relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400" />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    placeholder="John Doe"
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Email Address
                </label>

                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400" />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    placeholder="name@example.com"
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Photo URL
                </label>

                <div className="group relative">
                  <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400" />

                  <input
                    type="url"
                    name="photo"
                    value={form.photo}
                    placeholder="https://example.com/photo.jpg"
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Register As
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Password
                </label>

                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    placeholder="Minimum 6 chars, number & special char"
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-12 text-sm text-slate-800 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />

                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Example: <span className="font-semibold">Medi@123</span>
                </p>
              </div>

              {/* Custom Terms Checkbox */}
              <button
                type="button"
                onClick={handleAgreeToggle}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-teal-400 dark:border-slate-700 dark:bg-slate-950"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    agree
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>

                <span className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-300">
                  {agree ? (
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      Agreed.{" "}
                    </span>
                  ) : null}
                  I agree to the{" "}
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    Privacy Policy
                  </span>
                  .
                </span>
              </button>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:from-teal-700 hover:to-teal-800 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-teal-600 transition hover:text-teal-700 hover:underline dark:text-teal-400"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}