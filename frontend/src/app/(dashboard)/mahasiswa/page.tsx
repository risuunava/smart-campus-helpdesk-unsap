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
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--th-page)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760]" />
      </div>
    );
  }

  return (
    <div className="container-mobile py-6 space-y-6">
      {/* Header: Greeting & System Status */}
      <div className="px-1">
        <h1 className="text-2xl font-black tracking-tight leading-none th-text">
          Selamat Datang!
        </h1>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex rounded-full h-2 w-2 bg-[#1ed760]"></span>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] th-text-2">
            Pusat Layanan Mahasiswa
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) - On mobile this is middle */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-6 min-w-0">
          {/* Stats Row - Compact cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card-clean p-4 flex flex-col items-center lg:items-start">
              <span className="text-[9px] font-bold uppercase tracking-wider mb-1 th-text-m">
                Total
              </span>
              <p className="text-xl font-black th-text">{stats.total}</p>
            </div>
            <div className="card-clean p-4 flex flex-col items-center lg:items-start">
              <span className="text-[9px] font-bold text-[#ffa42b] uppercase tracking-wider mb-1">
                Aktif
              </span>
              <p className="text-xl font-black th-text">{stats.open}</p>
            </div>
            <div className="card-clean p-4 flex flex-col items-center lg:items-start">
              <span className="text-[9px] font-bold text-[#1ed760] uppercase tracking-wider mb-1">
                Selesai
              </span>
              <p className="text-xl font-black th-text">{stats.resolved}</p>
            </div>
          </div>

          {/* Ticket Activity List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold tracking-tight th-text">
                Laporan Terbaru
              </h3>
              <Link href="/mahasiswa/tiket-saya">
                <button className="text-[9px] font-bold text-[#1ed760] uppercase tracking-widest hover:underline flex items-center gap-1.5">
                  Semua Laporan <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>

            <div className="rounded-2xl overflow-hidden divide-y" style={{ background: 'var(--th-base)', border: '1px solid var(--th-border)', borderColor: 'var(--th-border)' }}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5" style={{ borderBottomColor: 'var(--th-border)' }}>
                    <Skeleton className="h-4 w-1/3 mb-2 skeleton-pulse" />
                    <Skeleton className="h-3 w-full skeleton-pulse" />
                  </div>
                ))
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest th-text-f">
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
                      className="block p-4 sm:p-5 transition-colors group"
                      style={{ borderBottomColor: 'var(--th-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--th-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[9px] font-bold th-text-m">
                              {ticket.ticket_code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                            >
                              {statusColor.label}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold group-hover:text-[#1ed760] transition-colors truncate th-text">
                            {ticket.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] th-text-m">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {timeAgo(ticket.updated_at || ticket.created_at)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 th-text-f" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) - On mobile this is TOP */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-6 min-w-0">
          {/* Primary CTA - Mulai Laporan */}
          <div className="rounded-[24px] p-6 shadow-2xl relative overflow-hidden glossy-card text-center sm:text-left">
            <div className="relative z-10">
              <h3 className="font-black text-xl leading-tight mb-1 th-text">Ada Masalah?</h3>
              <p className="text-[11px] font-bold mb-5 th-text-2">Laporkan kendala fasilitas atau akademik segera.</p>
              <Link href="/mahasiswa/buat-laporan">
                <button className="btn-gradient animate-shine w-full py-3.5 px-6 text-[11px] font-black uppercase tracking-[2px] shadow-lg">
                  Mulai Laporan
                </button>
              </Link>
            </div>
          </div>

          {/* Search FAQ Shortcut */}
          <div className="card-clean p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 th-text-m" />
              <input
                type="text"
                placeholder="Cari solusi cepat... (Tekan Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                    router.push(`/mahasiswa/faq?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                  }
                }}
                className="w-full rounded-full py-2.5 pl-10 pr-4 text-[11px] outline-none transition-all input-focus"
              />
            </div>
          </div>

          {/* Help Center (Desktop sidebar, mobile bottom button) */}
          <div className="hidden lg:block space-y-4">
            <Link
              href="/mahasiswa/faq"
              className="block card-hover p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <HelpCircle className="h-5 w-5 text-[#539df5]" />
                <ArrowRight className="h-4 w-4 th-text-f" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider th-text">
                Pusat Bantuan
              </h4>
              <p className="text-[10px] mt-1 th-text-m">
                Temukan jawaban masalah umum secara mandiri.
              </p>
            </Link>
          </div>

          {/* Mobile FAQ CTA (Only on mobile) */}
          <Link
            href="/mahasiswa/faq"
            className="lg:hidden block card-hover p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider th-text">
                  Pusat Bantuan
                </h4>
                <p className="text-[10px] th-text-m">
                  Lihat FAQ & Panduan
                </p>
              </div>
              <ArrowRight className="h-4 w-4 th-text-f" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
