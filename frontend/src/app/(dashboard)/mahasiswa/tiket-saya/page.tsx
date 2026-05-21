"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Ticket } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getPriorityColor, getStatusColor, timeAgo, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Search, Eye, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TiketSayaPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, [currentPage, search, sortBy, sortOrder]);

  async function fetchTickets() {
    setIsLoading(true);
    try {
      const response = await api.getTickets({
        page: currentPage,
        per_page: 10,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setTickets(response.data.data);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold th-text tracking-tight">
            Tiket Saya
          </h1>
          <p className="text-sm th-text-2 mt-1">
            Daftar laporan yang telah Anda ajukan
          </p>
        </div>
        <Link href="/mahasiswa/buat-laporan">
          <button className="btn-gradient animate-shine px-6 py-2.5 text-sm flex items-center gap-2 uppercase tracking-wide">
            <Plus className="h-4 w-4" />
            Buat Laporan
          </button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card-clean rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 th-text-m" />
          <input
            placeholder="Cari berdasarkan judul atau kode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full input-focus pl-10 pr-4 py-2 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select 
            value={sortBy} 
            onValueChange={(val) => { setSortBy(val); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-full md:w-[160px] th-base th-border th-text-2 rounded-lg hover:border-th-border-s">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent className="th-base th-border th-text-2">
              <SelectItem value="created_at" className="focus:bg-th-hover focus:text-th-text cursor-pointer">Tanggal</SelectItem>
              <SelectItem value="priority" className="focus:bg-th-hover focus:text-th-text cursor-pointer">Prioritas</SelectItem>
              <SelectItem value="status" className="focus:bg-th-hover focus:text-th-text cursor-pointer">Status</SelectItem>
              <SelectItem value="title" className="focus:bg-th-hover focus:text-th-text cursor-pointer">Judul</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 th-base th-border th-text-2 hover:th-text rounded-lg transition-colors border"
            style={{ borderColor: 'var(--th-border)' }}
            title={sortOrder === "asc" ? "Urutan Menurun" : "Urutan Menaik"}
          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === "asc" ? "" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      {/* Ticket List - Mobile View (Cards) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-clean rounded-xl p-5 h-[120px]">
              <Skeleton className="h-4 w-1/4 mb-4 skeleton-pulse" />
              <Skeleton className="h-5 w-3/4 mb-3 skeleton-pulse" />
              <Skeleton className="h-3 w-1/2 skeleton-pulse" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="card-clean rounded-xl p-12 text-center">
            <p className="th-text-m">Tidak ada tiket ditemukan</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const priorityColor = getPriorityColor(ticket.priority);
            const statusColor = getStatusColor(ticket.status);
            
            return (
              <div
                key={ticket.id}
                className="card-hover rounded-xl p-4 group cursor-pointer"
                onClick={() => router.push(`/mahasiswa/tiket/${ticket.id}`)}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] th-text-m tracking-wider">
                      {ticket.ticket_code}
                    </span>
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                        {statusColor.label}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold th-text mb-1 group-hover:text-[#1ed760] transition-colors truncate">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] th-text-m">
                      <span>{ticket.category}</span>
                      <span className="w-1 h-1 rounded-full bg-th-border" style={{ backgroundColor: 'var(--th-border)' }} />
                      <span>{timeAgo(ticket.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-1 border-t th-border" style={{ borderTopColor: 'var(--th-border)' }}>
                    <div className="flex flex-col">
                      <p className="text-[9px] th-text-f uppercase font-bold tracking-tight">Terakhir Diperbarui</p>
                      <p className="text-[11px] th-text-2">{formatDate(ticket.updated_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#1ed760] text-[11px] font-semibold uppercase tracking-wider">
                      <span>Detail</span>
                      <Eye className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket List - Desktop View (Table) */}
      <div className="hidden md:block card-clean rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b" style={{ background: 'var(--th-raised)', borderBottomColor: 'var(--th-border)' }}>
              <th className="px-6 py-4 text-[10px] font-bold th-text-m uppercase tracking-widest w-[120px]">Kode</th>
              <th className="px-6 py-4 text-[10px] font-bold th-text-m uppercase tracking-widest">Judul Laporan</th>
              <th className="px-6 py-4 text-[10px] font-bold th-text-m uppercase tracking-widest w-[120px]">Kategori</th>
              <th className="px-6 py-4 text-[10px] font-bold th-text-m uppercase tracking-widest w-[120px]">Prioritas</th>
              <th className="px-6 py-4 text-[10px] font-bold th-text-m uppercase tracking-widest w-[140px]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold th-text-m uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--th-border)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottomColor: 'var(--th-border)' }}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16 skeleton-pulse" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-64 skeleton-pulse" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20 skeleton-pulse" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-16 skeleton-pulse" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20 skeleton-pulse" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto skeleton-pulse" /></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center th-text-m">Tidak ada tiket ditemukan</td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const priorityColor = getPriorityColor(ticket.priority);
                const statusColor = getStatusColor(ticket.status);
                return (
                  <tr 
                    key={ticket.id} 
                    className="transition-colors cursor-pointer group"
                    style={{ borderBottomColor: 'var(--th-border)' }}
                    onClick={() => router.push(`/mahasiswa/tiket/${ticket.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--th-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-6 py-4 font-mono text-xs th-text-m">{ticket.ticket_code}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold th-text group-hover:text-[#1ed760] transition-colors line-clamp-1">{ticket.title}</span>
                        <span className="text-[10px] th-text-m mt-0.5">{timeAgo(ticket.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] th-text-2">{ticket.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                        {statusColor.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="p-2 rounded-lg th-text-2 transition-colors"
                        style={{ background: 'var(--th-raised)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#1ed760'; e.currentTarget.style.background = 'rgba(30, 215, 96, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--th-text-secondary)'; e.currentTarget.style.background = 'var(--th-raised)'; }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            className="p-2 rounded-lg border th-text-2 hover:th-text disabled:opacity-20 transition-colors"
            style={{ background: 'var(--th-base)', borderColor: 'var(--th-border)' }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-xs th-text-m font-medium uppercase tracking-widest">
            Halaman {currentPage} / {lastPage}
          </span>
          
          <button
            className="p-2 rounded-lg border th-text-2 hover:th-text disabled:opacity-20 transition-colors"
            style={{ background: 'var(--th-base)', borderColor: 'var(--th-border)' }}
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}