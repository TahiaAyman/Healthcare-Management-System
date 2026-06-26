"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "admin") {
      router.replace("/dashboard/admin");
      return;
    }

    if (user.role === "doctor") {
      router.replace("/dashboard/doctor");
      return;
    }

    if (user.role === "patient") {
      router.replace("/dashboard/patient");
      return;
    }

    router.replace("/login");
  }, [user, loading, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <Activity className="h-8 w-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black text-slate-950">
          Opening Dashboard
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Redirecting you to your role-based dashboard...
        </p>
      </div>
    </div>
  );
}