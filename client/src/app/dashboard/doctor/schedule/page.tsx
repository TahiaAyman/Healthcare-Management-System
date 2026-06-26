"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";

import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { doctorDashboardAPI, type DoctorSchedule } from "@/services/api";

type ScheduleForm = {
  day: string;
  date: string;
  startTime: string;
  endTime: string;
};

const initialForm: ScheduleForm = {
  day: "",
  date: "",
  startTime: "",
  endTime: "",
};

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [form, setForm] = useState<ScheduleForm>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      const data = await doctorDashboardAPI.getSchedules();

      setSchedules(data || []);
    } catch (error: any) {
      alert(error.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.day || !form.startTime || !form.endTime) {
      alert("Day, start time, and end time are required");
      return;
    }

    try {
      setSaving(true);

      if (editId) {
        await doctorDashboardAPI.updateSchedule(editId, {
          day: form.day,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        });

        alert("Schedule updated successfully");
      } else {
        await doctorDashboardAPI.addSchedule({
          day: form.day,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        });

        alert("Schedule added successfully");
      }

      setForm(initialForm);
      setEditId(null);
      fetchSchedules();
    } catch (error: any) {
      alert(error.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditId(schedule._id);

    setForm({
      day: schedule.day || "",
      date: schedule.date || "",
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialForm);
  };

  const handleDelete = async (scheduleId: string) => {
    const confirmDelete = confirm("Are you sure you want to remove this schedule?");

    if (!confirmDelete) return;

    try {
      await doctorDashboardAPI.deleteSchedule(scheduleId);

      alert("Schedule removed successfully");
      fetchSchedules();
    } catch (error: any) {
      alert(error.message || "Failed to remove schedule");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <section className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Doctor Schedule
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
              Manage Schedule
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Add, update, and remove your available consultation days and time slots.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <CalendarDays size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    {editId ? "Update Schedule" : "Add Schedule"}
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Set your consultation availability.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Day
                  </label>

                  <select
                    name="day"
                    value={form.day}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">Select Day</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Date Optional
                  </label>

                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Start Time
                  </label>

                  <input
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    End Time
                  </label>

                  <input
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editId ? <Pencil size={18} /> : <Plus size={18} />}
                  {saving ? "Saving..." : editId ? "Update Schedule" : "Add Schedule"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* TABLE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    My Schedules
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    All available consultation slots are listed here.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-xs font-extrabold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  Total: {schedules.length}
                </span>
              </div>

              {loading ? (
                <div className="animate-pulse rounded-2xl bg-slate-100 p-8 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  Loading schedules...
                </div>
              ) : schedules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <CalendarDays className="mx-auto h-12 w-12 text-teal-600 dark:text-teal-400" />

                  <h3 className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">
                    No schedule added yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Add your first available consultation slot from the form.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <th className="py-3">Day</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Start</th>
                        <th className="py-3">End</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {schedules.map((schedule) => (
                        <tr
                          key={schedule._id}
                          className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                        >
                          <td className="py-4 font-bold text-slate-950 dark:text-white">
                            {schedule.day}
                          </td>

                          <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                            {schedule.date || "-"}
                          </td>

                          <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                            {schedule.startTime}
                          </td>

                          <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                            {schedule.endTime}
                          </td>

                          <td className="py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                                schedule.isAvailable
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                              }`}
                            >
                              {schedule.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </td>

                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(schedule)}
                                className="rounded-xl bg-blue-50 p-3 text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(schedule._id)}
                                className="rounded-xl bg-red-50 p-3 text-red-700 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}