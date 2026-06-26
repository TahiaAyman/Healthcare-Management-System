"use client";

import { Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  FilePlus,
  FileText,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import ProtectedRoute from "@/components/providers/ProtectedRoute";
import {
  doctorDashboardAPI,
  type DoctorPrescription,
} from "@/services/api";

type PrescriptionForm = {
  appointmentId: string;
  diagnosis: string;
  medications: string;
  notes: string;
};

const initialForm: PrescriptionForm = {
  appointmentId: "",
  diagnosis: "",
  medications: "",
  notes: "",
};

export default function DoctorPrescriptionsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading prescription page...</div>}>
      <DoctorPrescriptionsContent />
    </Suspense>
  );
}

function DoctorPrescriptionsContent() {
  const searchParams = useSearchParams();
  const appointmentIdFromUrl = searchParams.get("appointmentId") || "";

  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [form, setForm] = useState<PrescriptionForm>({
    ...initialForm,
    appointmentId: appointmentIdFromUrl,
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);

      const data = await doctorDashboardAPI.getPrescriptions();

      setPrescriptions(data || []);
    } catch (error: any) {
      alert(error.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditId(null);

    setForm({
      ...initialForm,
      appointmentId: appointmentIdFromUrl,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editId && !form.appointmentId) {
      alert("Appointment ID is required");
      return;
    }

    if (!form.diagnosis || !form.medications) {
      alert("Diagnosis and medications are required");
      return;
    }

    try {
      setSaving(true);

      if (editId) {
        await doctorDashboardAPI.updatePrescription(editId, {
          diagnosis: form.diagnosis,
          medications: form.medications,
          notes: form.notes,
        });

        alert("Prescription updated successfully");
      } else {
        await doctorDashboardAPI.createPrescription({
          appointmentId: form.appointmentId,
          diagnosis: form.diagnosis,
          medications: form.medications,
          notes: form.notes,
        });

        alert("Prescription created successfully");
      }

      resetForm();
      fetchPrescriptions();
    } catch (error: any) {
      alert(error.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (prescription: DoctorPrescription) => {
    setEditId(prescription._id);

    setForm({
      appointmentId: "",
      diagnosis: prescription.diagnosis || "",
      medications: prescription.medications || "",
      notes: prescription.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (prescriptionId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmDelete) return;

    try {
      await doctorDashboardAPI.deletePrescription(prescriptionId);

      alert("Prescription deleted successfully");
      fetchPrescriptions();
    } catch (error: any) {
      alert(error.message || "Failed to delete prescription");
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (appointmentIdFromUrl && !editId) {
      setForm((prev) => ({
        ...prev,
        appointmentId: appointmentIdFromUrl,
      }));
    }
  }, [appointmentIdFromUrl, editId]);

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <section className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                Doctor Prescriptions
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
                Prescription Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Create and update prescriptions after completing patient
                consultations.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPrescriptions}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <FilePlus size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    {editId ? "Update Prescription" : "Create Prescription"}
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add diagnosis, medications, and consultation notes.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {!editId && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                      Appointment ID
                    </label>

                    <input
                      name="appointmentId"
                      value={form.appointmentId}
                      onChange={handleChange}
                      placeholder="Appointment ID"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />

                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      This will auto-fill when you click Prescription after
                      marking an appointment completed.
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Diagnosis
                  </label>

                  <textarea
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Example: Fever and throat infection"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Medications
                  </label>

                  <textarea
                    name="medications"
                    value={form.medications}
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder="Example: Napa 500mg - 1 tablet after meal, 3 times daily for 3 days"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Additional advice or follow-up instructions"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editId ? <Pencil size={18} /> : <FilePlus size={18} />}
                  {saving
                    ? "Saving..."
                    : editId
                    ? "Update Prescription"
                    : "Create Prescription"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* LIST */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    My Prescriptions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    All prescriptions created by you are listed here.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-xs font-extrabold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  Total: {prescriptions.length}
                </span>
              </div>

              {loading ? (
                <div className="animate-pulse rounded-2xl bg-slate-100 p-8 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  Loading prescriptions...
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <FileText className="mx-auto h-12 w-12 text-teal-600 dark:text-teal-400" />

                  <h3 className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">
                    No prescription created yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Mark an appointment completed, then create a prescription
                    for that patient.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                            {prescription.patientId?.name || "Patient"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {prescription.patientId?.email || "-"}
                          </p>

                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Appointment:
                            <span className="ml-1 font-bold text-slate-700 dark:text-slate-200">
                              {prescription.appointmentId?.appointmentDate ||
                                "-"}{" "}
                              at{" "}
                              {prescription.appointmentId?.appointmentTime ||
                                "-"}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(prescription)}
                            className="rounded-xl bg-blue-50 p-3 text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(prescription._id)}
                            className="rounded-xl bg-red-50 p-3 text-red-700 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <InfoBox
                          title="Diagnosis"
                          value={prescription.diagnosis}
                        />

                        <InfoBox
                          title="Medications"
                          value={prescription.medications}
                        />

                        <InfoBox
                          title="Notes"
                          value={prescription.notes || "-"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}