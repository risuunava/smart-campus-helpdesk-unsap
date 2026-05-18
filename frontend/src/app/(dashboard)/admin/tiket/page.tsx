"use client";

import { TicketTable } from "@/components/dashboard/TicketTable";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminTicketsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && user?.role !== "admin" && user?.role !== "master_admin") {
      router.push("/mahasiswa");
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white animate-fade-in">
          Semua Tiket
        </h1>
        <p className="text-[#b3b3b3] mt-1">
          Daftar seluruh laporan dan keluhan yang masuk ke sistem.
        </p>
      </div>

      {/* Ticket Table */}
      <div className="bg-[#181818] border border-[#282828] rounded-xl p-4">
        <TicketTable />
      </div>
    </div>
  );
}
