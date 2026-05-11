"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { AuthProvider } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#121212]">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}