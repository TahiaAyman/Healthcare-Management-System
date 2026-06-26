"use client";

import { motion } from "framer-motion";
import {
  AlarmClock,
  Building2,
  Clock,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function ContactPage() {
  const contactCards = [
    {
      title: "Our Location",
      value: "Dhaka, Bangladesh",
      icon: MapPin,
    },
    {
      title: "Email Us",
      value: "support@medicare.com",
      icon: Mail,
    },
    {
      title: "Call Us",
      value: "+880 1234-567890",
      icon: Phone,
    },
    {
      title: "Emergency Hotline",
      value: "999 / 911 (24/7)",
      icon: AlarmClock,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* HERO SECTION */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Contact Us
            </p>

            <h1 className="text-4xl font-extrabold leading-tight text-slate-950 dark:text-white md:text-5xl">
              We Are Here to Help You
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Reach out to MediCare Connect for healthcare support, appointment
              assistance, emergency information, or general service inquiries.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-700 shadow-sm dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300">
                <ShieldCheck size={20} />
                Trusted Support
              </div>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-200 bg-white px-5 py-3 text-sm font-bold text-cyan-700 shadow-sm dark:border-cyan-500/30 dark:bg-slate-900 dark:text-cyan-300">
                <Clock size={20} />
                24/7 Assistance
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-teal-200 to-blue-200 opacity-60 blur-2xl dark:from-teal-500/20 dark:to-blue-500/20" />

            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d"
              alt="Hospital building"
              className="relative h-[330px] w-full rounded-3xl border-8 border-white object-cover shadow-2xl dark:border-slate-800 md:h-[420px]"
            />
          </motion.div>
        </div>
      </section>

      {/* CONTACT INFO SECTION */}
      <section className="bg-white px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Contact Information
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">
              Get in Touch with MediCare
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use the information below to contact our healthcare support team.
              We are available for general support, appointment-related help, and
              emergency guidance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.value}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUPPORT DETAILS SECTION */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <Headphones size={28} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Patient Support
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Patients can contact us for appointment booking help, doctor
              search support, payment issues, or account-related questions.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <Building2 size={28} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Hospital Coordination
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Hospitals and administrators can coordinate with MediCare Connect
              to manage doctors, appointments, and patient service records.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <AlarmClock size={28} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Emergency Help
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              For urgent medical emergencies, call the emergency hotline
              immediately. MediCare Connect provides support information but does
              not replace emergency medical services.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}