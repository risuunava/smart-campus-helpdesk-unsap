"use client";

import { AuthProvider } from "@/hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#121212]">
        {children}
      </div>
    </AuthProvider>
  );
}