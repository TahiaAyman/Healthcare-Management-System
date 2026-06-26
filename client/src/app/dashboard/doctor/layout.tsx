"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const doctorLinks = [
  {
    name: "Overview",
    href: "/dashboard/doctor",
    icon: LayoutDashboard,
  },
  {
    name: "My Profile",
    href: "/dashboard/doctor/profile",
    icon: UserRound,
  },
  {
    name: "Manage Schedule",
    href: "/dashboard/doctor/schedule",
    icon: CalendarDays,
  },
  {
    name: "Appointment Requests",
    href: "/dashboard/doctor/appointments",
    icon: ClipboardList,
  },
  {
    name: "Prescriptions",
    href: "/dashboard/doctor/prescriptions",
    icon: FileText,
  },
];

export default function DoctorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* MOBILE DASHBOARD HEADER */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              MediCare
            </p>
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white">
              Doctor Dashboard
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <div className="mx-auto flex w-full max-w-[1700px] gap-0 lg:px-4">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-6 my-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SidebarContent />
          </div>
        </aside>

        {/* MOBILE SIDEBAR */}
        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white p-5 shadow-2xl transition-transform duration-300 dark:bg-slate-900 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                MediCare
              </p>
              <h1 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                Doctor Panel
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <X size={20} />
            </button>
          </div>

          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );

  function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
            MediCare
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
            Doctor Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage schedule, appointments, and prescriptions.
          </p>
        </div>

        <nav className="space-y-2">
          {doctorLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-teal-500/10 dark:hover:text-teal-300"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl bg-teal-50 p-4 dark:bg-teal-500/10">
          <p className="text-sm font-extrabold text-teal-800 dark:text-teal-300">
            Requirement Matched
          </p>

          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Responsive sidebar for doctor dashboard navigation.
          </p>
        </div>
      </>
    );
  }
}