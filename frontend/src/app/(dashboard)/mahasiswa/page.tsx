"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Ticket } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getPriorityColor, getStatusColor, timeAgo } from "@/lib/utils";
import Link from "next/link";
import {
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  HelpCircle,
  FileText,
  Search,
} from "lucide-react";

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
        open: allTickets.filter(
          (t) => t.status === "open" || t.status === "in_progress",
        ).length,
        resolved: allTickets.filter(
          (t) => t.status === "resolved" || t.status === "closed",
        ).length,
      });
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  return (
    <div className="container-mobile py-6 space-y-6">
      {/* Header: Greeting & System Status */}
      <div className="px-1">
        <h1 className="text-2xl font-black text-white tracking-tight leading-none">
          Selamat Datang!
        </h1>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex rounded-full h-2 w-2 bg-[#1ed760]"></span>
          <p className="text-[10px] font-bold text-[#b3b3b3] uppercase tracking-[0.1em]">
            Pusat Layanan Mahasiswa
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) - On mobile this is middle */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
          {/* Stats Row - Compact cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 flex flex-col items-center lg:items-start">
              <span className="text-[9px] font-bold text-[#666666] uppercase tracking-wider mb-1">
                Total
              </span>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 flex flex-col items-center lg:items-start">
              <span className="text-[9px] font-bold text-[#ffa42b] uppercase tracking-wider mb-1">
                Aktif
              </span>
              <p className="text-xl font-black text-white">{stats.open}</p>
            </div>
            <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 flex flex-col items-center lg:items-start">
              <span className="text-[9px] font-bold text-[#1ed760] uppercase tracking-wider mb-1">
                Selesai
              </span>
              <p className="text-xl font-black text-white">{stats.resolved}</p>
            </div>
          </div>

          {/* Ticket Activity List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Laporan Terbaru
              </h3>
              <Link href="/mahasiswa/tiket-saya">
                <button className="text-[9px] font-bold text-[#1ed760] uppercase tracking-widest hover:underline flex items-center gap-1.5">
                  Semua Laporan <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>

            <div className="bg-[#121212] border border-[#282828] rounded-2xl overflow-hidden divide-y divide-[#282828]">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5">
                    <Skeleton className="h-4 w-1/3 bg-[#282828] mb-2" />
                    <Skeleton className="h-3 w-full bg-[#181818]" />
                  </div>
                ))
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[11px] font-bold text-[#4d4d4d] uppercase tracking-widest">
                    Belum ada aktivitas
                  </p>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const statusColor = getStatusColor(ticket.status);
                  return (
                    <Link
                      key={ticket.id}
                      href={`/mahasiswa/tiket/${ticket.id}`}
                      className="block p-4 sm:p-5 hover:bg-[#181818] active:bg-[#1f1f1f] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[9px] font-bold text-[#666666]">
                              {ticket.ticket_code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                            >
                              {statusColor.label}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#1ed760] transition-colors truncate">
                            {ticket.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-[#666666]">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {timeAgo(ticket.updated_at || ticket.created_at)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#282828] flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) - On mobile this is TOP */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          {/* Primary CTA - Mulai Laporan - Dark with subtle top green stroke */}
          <div className="rounded-[24px] bg-[#0f0f0f] border border-white/5 p-6 shadow-2xl relative overflow-hidden">
            {/* The elegant top green stroke (gradient) */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1ed760]/60 to-transparent" />
            
            <div className="relative z-10">
              <h3 className="text-white font-black text-xl leading-tight mb-1">Ada Masalah?</h3>
              <p className="text-[#b3b3b3] text-[11px] font-bold mb-5">Laporkan kendala fasilitas atau akademik segera.</p>
              <Link href="/mahasiswa/buat-laporan">
                <button className="btn-gradient animate-shine w-full py-3.5 px-6 text-[11px] font-black uppercase tracking-[2px] shadow-lg">
                  Mulai Laporan
                </button>
              </Link>
            </div>
          </div>

          {/* Search FAQ Shortcut */}
          <div className="bg-[#181818] rounded-2xl p-4 border border-[#282828]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <input
                type="text"
                placeholder="Cari solusi cepat... (Tekan Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                    window.location.href = `/mahasiswa/faq?q=${encodeURIComponent(e.currentTarget.value.trim())}`;
                  }
                }}
                className="w-full bg-[#121212] border border-[#3e3e3e] rounded-full py-2.5 pl-10 pr-4 text-[11px] text-white placeholder:text-[#666666] outline-none focus:border-[#1ed760] transition-all"
              />
            </div>
          </div>

          {/* Help Center (Desktop sidebar, mobile bottom button) */}
          <div className="hidden lg:block space-y-4">
            <Link
              href="/mahasiswa/faq"
              className="block bg-[#181818] border border-[#282828] rounded-2xl p-5 hover:border-[#4d4d4d] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <HelpCircle className="h-5 w-5 text-[#539df5]" />
                <ArrowRight className="h-4 w-4 text-[#4d4d4d]" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Pusat Bantuan
              </h4>
              <p className="text-[10px] text-[#666666] mt-1">
                Temukan jawaban masalah umum secara mandiri.
              </p>
            </Link>
          </div>

          {/* Mobile FAQ CTA (Only on mobile) */}
          <Link
            href="/mahasiswa/faq"
            className="lg:hidden block bg-[#181818] border border-[#282828] rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pusat Bantuan
                </h4>
                <p className="text-[10px] text-[#666666]">
                  Lihat FAQ & Panduan
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#4d4d4d]" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
