import { Loader2, Stethoscope } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
          <Stethoscope size={42} />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-950 dark:text-white">
          MediCare Connect
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Preparing your healthcare experience. Please wait a moment.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 font-bold text-teal-700 dark:text-teal-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading...
        </div>
      </div>
    </main>
  );
}