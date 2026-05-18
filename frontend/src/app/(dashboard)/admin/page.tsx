"use client";

import { StatsCards } from "@/components/dashboard/StatsCards";
import { TicketTable } from "@/components/dashboard/TicketTable";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && user?.role !== "admin" && user?.role !== "master_admin") {
      router.push("/mahasiswa");
    }
  }, [isLoading, isAuthenticated, user]);

  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await api.exportTickets();
      toast({
        title: "Export Berhasil",
        description: `File ${response.data.filename} berhasil dibuat (${response.data.total_records} data).`,
      });
    } catch (error: any) {
      toast({
        title: "Export Gagal",
        description: error.message || "Terjadi kesalahan saat export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white animate-fade-in">
            Dashboard Admin
          </h1>
          <p className="text-[#b3b3b3] mt-1">
            Selamat datang, {user?.name}. Berikut ringkasan tiket hari ini.
          </p>
        </div>
        <button
          className="btn-gradient px-5 py-2.5 text-sm flex items-center gap-2 uppercase tracking-wider"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Mengexport..." : "Export Data"}
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Ticket Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">
          Daftar Tiket Terbaru
        </h2>
        <TicketTable />
      </div>
    </div>
  );
}