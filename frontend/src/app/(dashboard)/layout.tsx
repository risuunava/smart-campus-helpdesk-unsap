"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
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
        <Header />
        <main className="lg:ml-64 min-h-screen pt-16">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}