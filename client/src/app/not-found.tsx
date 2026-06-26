import Link from "next/link";
import { Home, Search, Stethoscope } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 px-4 py-20 text-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
        {/* Illustration */}
        <div className="relative mb-10">
          <div className="absolute -inset-8 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-500/20" />

          <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-teal-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute left-8 top-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm dark:bg-teal-500/10 dark:text-teal-300">
              <Stethoscope size={34} />
            </div>

            <div className="absolute bottom-10 right-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-300">
              <Search size={34} />
            </div>

            <div>
              <h1 className="text-8xl font-black text-teal-600 dark:text-teal-300">
                404
              </h1>

              <p className="mt-2 text-sm font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Not Found
              </p>
            </div>
          </div>
        </div>

        {/* Text */}
        <p className="text-sm font-black uppercase tracking-wide text-teal-600 dark:text-teal-400">
          Page Not Found
        </p>

        <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
          Oops! This healthcare page does not exist.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          The page you are looking for may have been moved, deleted, or the URL
          may be incorrect. Please go back to the homepage and continue using
          MediCare Connect.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 px-7 py-4 font-black text-white shadow-lg transition hover:shadow-xl"
          >
            <Home size={20} />
            Back Home
          </Link>

          <Link
            href="/doctors"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-7 py-4 font-black text-teal-700 shadow-sm transition hover:bg-teal-50 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            <Search size={20} />
            Find Doctors
          </Link>
        </div>

        {/* Extra info */}
        <div className="mt-14 grid w-full max-w-4xl gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black text-slate-950 dark:text-white">
              Need a Doctor?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Search verified healthcare specialists and book appointments.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black text-slate-950 dark:text-white">
              Patient Dashboard
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Manage appointments, payments, reviews, and healthcare activity.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black text-slate-950 dark:text-white">
              Secure Platform
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              MediCare Connect uses protected routes and role-based access.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}