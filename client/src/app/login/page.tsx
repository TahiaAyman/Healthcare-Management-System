"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectByRole = (role: string) => {
    if (role === "admin") {
      router.push("/dashboard/admin");
      return;
    }

    if (role === "doctor") {
      router.push("/dashboard/doctor");
      return;
    }

    router.push("/dashboard/patient");
  };

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      alert("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        email: form.email,
        password: form.password,
      });

      if (data?.user?.role) {
        alert("Login successful");
        redirectByRole(data.user.role);
      }
    } catch (error: any) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const data = await googleLogin();

      if (data?.user?.role) {
        alert("Google login successful");
        redirectByRole(data.user.role);
      }
    } catch (error: any) {
      if (error?.code === "auth/popup-closed-by-user") {
        alert("Google login popup was closed");
      } else {
        alert(error.message || "Google login failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-teal-50 px-4 py-12 text-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-180px)] max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* LEFT SIDE */}
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm dark:bg-teal-500/10 dark:text-teal-300">
              <Activity size={30} />
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Welcome Back 👋
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
              Login to continue managing your appointments, doctors, payments,
              reviews, and healthcare records securely through your centralized
              panel.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-950 dark:text-white">
                    Secure JWT Authentication
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Protected private routes with persistent login.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <UserCheck size={22} />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-950 dark:text-white">
                    Role-based Dashboard Access
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Patient, doctor, and admin users are redirected correctly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGIN CARD */}
        <section className="mx-auto w-full max-w-[520px]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-600" />

            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                Login to Account
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Enter your registered credentials or continue with Google.
              </p>

              <form onSubmit={handleEmailLogin} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950">
                    <Mail size={19} className="text-slate-400" />

                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="name@example.com"
                      className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Password
                    </label>

                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      Forgot?
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950">
                    <Lock size={19} className="text-slate-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-slate-400 transition hover:text-teal-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <input type="checkbox" className="accent-teal-600" />
                  Keep me logged in
                </label>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn size={18} />
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-bold text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg">
                  G
                </span>
                {googleLoading ? "Connecting Google..." : "Continue with Google"}
              </button>

              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-extrabold text-teal-600 hover:underline dark:text-teal-400"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}