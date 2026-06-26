import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider />

            <Navbar />

            <main className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-950">
              {children}
            </main>

            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}