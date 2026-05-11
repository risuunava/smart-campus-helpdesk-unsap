"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Ticket } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPriorityColor, getStatusColor, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Plus, Clock, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function MahasiswaDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTickets();
    }
  }, [isAuthenticated]);

  async function fetchMyTickets() {
    try {
      const response = await api.getTickets({ per_page: 5 });
      setTickets(response.data.data);
      
      const allTickets = response.data.data;
      setStats({
        total: response.data.total,
        open: allTickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
        resolved: allTickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      });
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  return (
    <div className="container-mobile py-8">
      {/* Welcome Section — Dark card with green glow */}
      <div className="relative bg-[#181818] border border-[#282828] rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1ed760]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">
            Selamat Datang, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-[#b3b3b3]">
            Butuh bantuan? Laporkan masalah Anda dan kami akan segera menanganinya.
          </p>
          <Link href="/mahasiswa/buat-laporan">
            <button className="btn-gradient mt-4 px-6 py-2.5 text-sm flex items-center gap-2 uppercase tracking-wider">
              <Plus className="h-4 w-4" />
              Buat Laporan Baru
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all hover:bg-[#1f1f1f]">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">Total Laporan</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all hover:bg-[#1f1f1f]">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">Dalam Proses</p>
          <p className="text-3xl font-bold text-[#ffa42b]">{stats.open}</p>
        </div>
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all hover:bg-[#1f1f1f]">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">Selesai</p>
          <p className="text-3xl font-bold text-[#1ed760]">{stats.resolved}</p>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Laporan Terbaru
        </h2>
        <Link href="/mahasiswa/tiket-saya">
          <button className="btn-gradient-outline px-4 py-2 text-xs rounded-full flex items-center gap-2">
            Lihat Semua
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#181818] border border-[#282828] rounded-xl p-5">
              <Skeleton className="h-4 w-3/4 mb-2 bg-[#282828]" />
              <Skeleton className="h-3 w-1/2 bg-[#282828]" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-12 text-center">
            <AlertCircle className="h-12 w-12 text-[#4d4d4d] mx-auto mb-4" />
            <p className="text-[#b3b3b3]">Belum ada laporan</p>
            <Link href="/mahasiswa/buat-laporan">
              <button className="btn-gradient mt-4 px-6 py-2.5 text-sm uppercase tracking-wider">
                Buat Laporan Pertama
              </button>
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => {
            const priorityColor = getPriorityColor(ticket.priority);
            const statusColor = getStatusColor(ticket.status);
            
            return (
              <Link key={ticket.id} href={`/mahasiswa/tiket/${ticket.id}`}>
                <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all duration-200 hover:bg-[#1f1f1f] hover:border-[#3a3a3a] group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-[#666666]">
                          {ticket.ticket_code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                          {priorityColor.icon} {ticket.priority}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                          {statusColor.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-[#1ed760] transition-colors">{ticket.title}</h3>
                      <p className="text-sm text-[#666666] mt-1">{timeAgo(ticket.created_at)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[#4d4d4d] group-hover:text-[#1ed760] transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}