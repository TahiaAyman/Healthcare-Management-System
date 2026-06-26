const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

// =====================
// DOCTOR TYPES
// =====================
export type Doctor = {
  _id: string;
  userId?: string;
  email?: string;
  doctorName: string;
  specialization: string;
  qualifications?: string;
  experience: number;
  consultationFee: number;
  hospitalName?: string;
  profileImage?: string;
  availableDays?: string[];
  availableSlots?: string[];
  schedules?: DoctorSchedule[];
  verificationStatus?: "pending" | "verified" | "rejected";
  rating?: number;
  avgRating?: number;
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
  status?: string;
};

export type DoctorsResponse = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  doctors?: Doctor[];
};

// =====================
// DOCTOR DASHBOARD TYPES
// =====================
export type DoctorSchedule = {
  _id: string;
  day: string;
  date?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type DoctorStats = {
  doctorId?: string;
  doctorName?: string;
  totalPatients: number;
  totalAppointments: number;
  todaysAppointments: number;
  pendingAppointments: number;
  acceptedAppointments: number;
  rejectedAppointments: number;
  completedAppointments: number;
  reviewsReceived: number;
  verificationStatus: string;
  appointmentStatusData?: {
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
  };
};

export type AppointmentPatient = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  gender?: string;
};

export type DoctorAppointment = {
  _id: string;
  patientId: AppointmentPatient;
  doctorId?: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
  appointmentStatus:
    | "pending"
    | "accepted"
    | "rejected"
    | "completed"
    | "cancelled";
  paymentStatus: "unpaid" | "paid";
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorPrescription = {
  _id: string;
  doctorId?: string;
  patientId?: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
  };
  appointmentId?: {
    _id?: string;
    appointmentDate: string;
    appointmentTime: string;
    symptoms?: string;
  };
  diagnosis: string;
  medications: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// =====================
// PATIENT PRESCRIPTION TYPES
// =====================
export type PatientPrescription = {
  _id: string;
  doctorId?: {
    _id?: string;
    doctorName: string;
    specialization?: string;
    hospitalName?: string;
    profileImage?: string;
  };
  patientId?: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    photo?: string;
  };
  appointmentId?: {
    _id?: string;
    appointmentDate: string;
    appointmentTime: string;
    symptoms?: string;
    appointmentStatus?: string;
    paymentStatus?: string;
  };
  diagnosis: string;
  medications: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// =====================
// TOKEN HELPER
// =====================
export function getStoredToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("medicare_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
}

// =====================
// BASE REQUEST FUNCTION
// =====================
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token, headers } = options;

  const authToken = token ?? getStoredToken();

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data as T;
}

// =====================
// BASIC API METHODS
// =====================
const api = {
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, { method: "POST", body, token }),

  put: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, { method: "PUT", body, token }),

  patch: <T>(endpoint: string, body?: unknown, token?: string | null) =>
    request<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: "DELETE", token }),
};

// =====================
// AUTH API
// =====================
export const authAPI = {
  register: (payload: unknown) => api.post("/auth/register", payload),

  login: (payload: unknown) => api.post("/auth/login", payload),
};

// =====================
// PUBLIC DOCTOR API
// =====================
export const doctorAPI = {
  getAll: () => api.get<Doctor[] | DoctorsResponse>("/doctors"),

  getById: (id: string) => api.get<Doctor | { doctor: Doctor }>(`/doctors/${id}`),

  search: (params: {
    search?: string;
    specialization?: string;
    sort?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    verified?: boolean;
  }) => {
    const query = new URLSearchParams();

    if (params.search) query.set("search", params.search);
    if (params.specialization) query.set("specialization", params.specialization);

    // Backend expects sortBy
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sort) query.set("sortBy", params.sort);

    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.verified) query.set("verified", "true");

    return api.get<Doctor[] | DoctorsResponse>(`/doctors?${query.toString()}`);
  },
};

// =====================
// DOCTOR DASHBOARD API
// =====================
export const doctorDashboardAPI = {
  // Dashboard Stats
  getStats: () => api.get<DoctorStats>("/doctor/stats"),

  // Profile Management
  getProfile: () => api.get<Doctor>("/doctor/profile"),

  updateProfile: (payload: Partial<Doctor>) =>
    api.patch<{
      message: string;
      doctor: Doctor;
    }>("/doctor/profile", payload),

  // Schedule CRUD
  getSchedules: () => api.get<DoctorSchedule[]>("/doctor/schedules"),

  addSchedule: (payload: {
    day: string;
    date?: string;
    startTime: string;
    endTime: string;
  }) =>
    api.post<{
      message: string;
      schedules: DoctorSchedule[];
    }>("/doctor/schedules", payload),

  updateSchedule: (
    scheduleId: string,
    payload: {
      day?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    }
  ) =>
    api.patch<{
      message: string;
      schedules: DoctorSchedule[];
    }>(`/doctor/schedules/${scheduleId}`, payload),

  deleteSchedule: (scheduleId: string) =>
    api.delete<{
      message: string;
      schedules: DoctorSchedule[];
    }>(`/doctor/schedules/${scheduleId}`),

  // Appointment Requests
  getAppointments: () => api.get<DoctorAppointment[]>("/doctor/appointments"),

  updateAppointmentStatus: (
    appointmentId: string,
    status: "accepted" | "rejected" | "completed"
  ) =>
    api.patch<{
      message: string;
      appointment: DoctorAppointment;
      stats?: {
        totalAppointments: number;
        pendingAppointments: number;
        acceptedAppointments: number;
        rejectedAppointments: number;
        completedAppointments: number;
      };
      redirectToPrescription?: string | null;
    }>(`/doctor/appointments/${appointmentId}/status`, { status }),

  // Prescription Management
  getPrescriptions: () =>
    api.get<DoctorPrescription[]>("/doctor/prescriptions"),

  createPrescription: (payload: {
    appointmentId: string;
    diagnosis: string;
    medications: string;
    notes?: string;
  }) =>
    api.post<{
      message: string;
      prescription: DoctorPrescription;
    }>("/doctor/prescriptions", payload),

  updatePrescription: (
    prescriptionId: string,
    payload: {
      diagnosis?: string;
      medications?: string;
      notes?: string;
    }
  ) =>
    api.patch<{
      message: string;
      prescription: DoctorPrescription;
    }>(`/doctor/prescriptions/${prescriptionId}`, payload),

  deletePrescription: (prescriptionId: string) =>
    api.delete<{
      message: string;
    }>(`/doctor/prescriptions/${prescriptionId}`),
};

// =====================
// PATIENT PRESCRIPTION API
// =====================
export const patientPrescriptionAPI = {
  getMyPrescriptions: () =>
    api.get<{
      message: string;
      prescriptions: PatientPrescription[];
    }>("/prescriptions/my"),

  getByAppointment: (appointmentId: string) =>
    api.get<{
      message: string;
      prescription: PatientPrescription;
    }>(`/prescriptions/my/appointment/${appointmentId}`),
};

export default api;