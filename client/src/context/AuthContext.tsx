"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { signInWithPopup } from "firebase/auth";

import api from "@/services/api";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

export type UserRole = "patient" | "doctor" | "admin";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  gender?: string;
  status?: string;
};

export type AuthDoctorProfile = {
  _id: string;
  userId?: string;
  doctorName: string;
  email: string;
  specialization: string;
  qualifications?: string;
  experience?: number;
  consultationFee?: number;
  hospitalName?: string;
  profileImage?: string;
  availableDays?: string[];
  availableSlots?: string[];
  verificationStatus?: "pending" | "verified" | "rejected";
  status?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  photo?: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
  doctorProfile?: AuthDoctorProfile | null;
};

type RegisterResponse = {
  message: string;
  user: AuthUser;
  doctorProfile?: AuthDoctorProfile | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  doctorProfile: AuthDoctorProfile | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    payloadOrUser: LoginPayload | AuthUser,
    jwtToken?: string
  ) => Promise<LoginResponse | void>;

  googleLogin: () => Promise<LoginResponse>;

  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function saveAuthData(
  userData: AuthUser,
  jwtToken: string,
  doctorProfileData?: AuthDoctorProfile | null
) {
  localStorage.setItem("medicare_user", JSON.stringify(userData));
  localStorage.setItem("medicare_token", jwtToken);

  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", jwtToken);

  if (doctorProfileData) {
    localStorage.setItem(
      "medicare_doctor_profile",
      JSON.stringify(doctorProfileData)
    );
  } else {
    localStorage.removeItem("medicare_doctor_profile");
  }
}

function clearAuthData() {
  localStorage.removeItem("medicare_user");
  localStorage.removeItem("medicare_token");
  localStorage.removeItem("medicare_doctor_profile");

  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] =
    useState<AuthDoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("medicare_user") || localStorage.getItem("user");

    const storedToken =
      localStorage.getItem("medicare_token") || localStorage.getItem("token");

    const storedDoctorProfile = localStorage.getItem(
      "medicare_doctor_profile"
    );

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;

        setUser(parsedUser);
        setToken(storedToken);

        if (storedDoctorProfile) {
          setDoctorProfile(
            JSON.parse(storedDoctorProfile) as AuthDoctorProfile
          );
        }

        saveAuthData(
          parsedUser,
          storedToken,
          storedDoctorProfile
            ? (JSON.parse(storedDoctorProfile) as AuthDoctorProfile)
            : null
        );
      } catch {
        clearAuthData();
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    payloadOrUser: LoginPayload | AuthUser,
    jwtToken?: string
  ) => {
    if (jwtToken) {
      const userData = payloadOrUser as AuthUser;

      setUser(userData);
      setToken(jwtToken);
      setDoctorProfile(null);

      saveAuthData(userData, jwtToken, null);

      return;
    }

    const data = await api.post<LoginResponse>(
      "/auth/login",
      payloadOrUser as LoginPayload
    );

    setUser(data.user);
    setToken(data.token);
    setDoctorProfile(data.doctorProfile || null);

    saveAuthData(data.user, data.token, data.doctorProfile || null);

    return data;
  };

  const googleLogin = async () => {
    const firebaseResult = await signInWithPopup(firebaseAuth, googleProvider);

    const googleUser = firebaseResult.user;

    if (!googleUser.email) {
      throw new Error("Google account email not found");
    }

    const data = await api.post<LoginResponse>("/auth/google-login", {
      name: googleUser.displayName || "Google User",
      email: googleUser.email,
      photo: googleUser.photoURL || "",
    });

    setUser(data.user);
    setToken(data.token);
    setDoctorProfile(data.doctorProfile || null);

    saveAuthData(data.user, data.token, data.doctorProfile || null);

    return data;
  };

  const register = async (payload: RegisterPayload) => {
    const data = await api.post<RegisterResponse>("/auth/register", payload);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setDoctorProfile(null);

    clearAuthData();

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        doctorProfile,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        googleLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};