"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type UserRole = "patient" | "doctor" | "admin";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />

          <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
            Checking Access
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Please wait while we verify your login session.
          </p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
            Login Required
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Redirecting to login page.
          </p>
        </div>
      </section>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-900">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />

          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
            Unauthorized Access
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-300">
            You are logged in as{" "}
            <span className="font-extrabold capitalize text-teal-600 dark:text-teal-400">
              {user.role}
            </span>
            . You do not have permission to access this page.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            Go to My Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}