"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Save, UserRound } from "lucide-react";

import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { doctorDashboardAPI, type Doctor } from "@/services/api";

type DoctorProfileForm = {
  doctorName: string;
  specialization: string;
  qualifications: string;
  experience: number;
  consultationFee: number;
  hospitalName: string;
  profileImage: string;
  verificationStatus: "pending" | "verified" | "rejected";
};

const initialProfile: DoctorProfileForm = {
  doctorName: "",
  specialization: "",
  qualifications: "",
  experience: 0,
  consultationFee: 0,
  hospitalName: "",
  profileImage: "",
  verificationStatus: "pending",
};

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileForm>(initialProfile);
  const [daysText, setDaysText] = useState("");
  const [slotsText, setSlotsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const data = await doctorDashboardAPI.getProfile();

      setProfile({
        doctorName: data.doctorName || "",
        specialization: data.specialization || "",
        qualifications: data.qualifications || "",
        experience: data.experience || 0,
        consultationFee: data.consultationFee || 0,
        hospitalName: data.hospitalName || "",
        profileImage: data.profileImage || "",
        verificationStatus: data.verificationStatus || "pending",
      });

      setDaysText((data.availableDays || []).join(", "));
      setSlotsText((data.availableSlots || []).join(", "));
    } catch (error: any) {
      alert(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "experience" || name === "consultationFee"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload: Partial<Doctor> = {
        doctorName: profile.doctorName,
        specialization: profile.specialization,
        qualifications: profile.qualifications,
        experience: profile.experience,
        consultationFee: profile.consultationFee,
        hospitalName: profile.hospitalName,
        profileImage: profile.profileImage,
        availableDays: daysText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        availableSlots: slotsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await doctorDashboardAPI.updateProfile(payload);

      alert("Doctor profile updated successfully");
      fetchProfile();
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <section className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Doctor Profile
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
              Profile Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Update your professional information, consultation fee, and
              available consultation slots.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="animate-pulse rounded-2xl bg-slate-100 p-8 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Loading doctor profile...
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8"
            >
              <div className="mb-8 flex flex-col gap-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950 md:flex-row md:items-center">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Doctor profile"
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <UserRound size={42} />
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    {profile.doctorName || "Doctor Name"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {profile.specialization || "Specialization not added"}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold capitalize text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    Verification: {profile.verificationStatus}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Doctor Name"
                  name="doctorName"
                  value={profile.doctorName}
                  onChange={handleChange}
                  placeholder="Dr. Rahman"
                />

                <InputField
                  label="Specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  placeholder="Cardiology"
                />

                <InputField
                  label="Qualifications"
                  name="qualifications"
                  value={profile.qualifications}
                  onChange={handleChange}
                  placeholder="MBBS, FCPS"
                />

                <InputField
                  label="Hospital Name"
                  name="hospitalName"
                  value={profile.hospitalName}
                  onChange={handleChange}
                  placeholder="MediCare Hospital"
                />

                <InputField
                  label="Experience"
                  name="experience"
                  type="number"
                  value={String(profile.experience)}
                  onChange={handleChange}
                  placeholder="5"
                />

                <InputField
                  label="Consultation Fee"
                  name="consultationFee"
                  type="number"
                  value={String(profile.consultationFee)}
                  onChange={handleChange}
                  placeholder="1000"
                />

                <InputField
                  label="Profile Image URL"
                  name="profileImage"
                  value={profile.profileImage}
                  onChange={handleChange}
                  placeholder="https://..."
                />

                <InputField
                  label="Available Days"
                  name="availableDays"
                  value={daysText}
                  onChange={(event) => setDaysText(event.target.value)}
                  placeholder="Sunday, Monday, Tuesday"
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Available Slots"
                    name="availableSlots"
                    value={slotsText}
                    onChange={(event) => setSlotsText(event.target.value)}
                    placeholder="10:00 AM - 11:00 AM, 03:00 PM - 04:00 PM"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
}