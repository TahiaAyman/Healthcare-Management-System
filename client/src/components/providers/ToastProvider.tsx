"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "14px",
          background: "#ffffff",
          color: "#0f172a",
          fontWeight: "600",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        },
        success: {
          iconTheme: {
            primary: "#0d9488",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}