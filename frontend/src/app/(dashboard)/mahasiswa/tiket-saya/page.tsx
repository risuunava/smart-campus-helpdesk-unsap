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
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tiket Saya
          </h1>
          <p className="text-sm text-[#b3b3b3] mt-1">
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
      <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
          <input
            placeholder="Cari berdasarkan judul atau kode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#121212] border border-[#333333] text-white placeholder:text-[#4d4d4d] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#1ed760] outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select 
            value={sortBy} 
            onValueChange={(val) => { setSortBy(val); setCurrentPage(1); }}
          >
            <SelectTrigger className="w-full md:w-[160px] bg-[#121212] border-[#333333] text-sm text-[#b3b3b3] rounded-lg">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent className="bg-[#181818] border-[#282828] text-[#b3b3b3]">
              <SelectItem value="created_at">Tanggal</SelectItem>
              <SelectItem value="priority">Prioritas</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="title">Judul</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 bg-[#121212] border border-[#333333] text-[#b3b3b3] hover:text-white rounded-lg transition-colors"
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
            <div key={i} className="bg-[#181818] border border-[#282828] rounded-xl p-5 h-[120px]">
              <Skeleton className="h-4 w-1/4 mb-4 bg-[#282828]" />
              <Skeleton className="h-5 w-3/4 mb-3 bg-[#282828]" />
              <Skeleton className="h-3 w-1/2 bg-[#282828]" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="bg-[#181818] border border-[#282828] rounded-xl p-12 text-center">
            <p className="text-[#666666]">Tidak ada tiket ditemukan</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const priorityColor = getPriorityColor(ticket.priority);
            const statusColor = getStatusColor(ticket.status);
            
            return (
              <div
                key={ticket.id}
                className="bg-[#181818] border border-[#282828] rounded-xl p-4 cursor-pointer transition-colors hover:bg-[#1f1f1f] group"
                onClick={() => router.push(`/mahasiswa/tiket/${ticket.id}`)}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#666666] tracking-wider">
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
                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-[#1ed760] transition-colors">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                      <span>{ticket.category}</span>
                      <span className="w-1 h-1 rounded-full bg-[#333333]" />
                      <span>{timeAgo(ticket.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#222222]">
                    <div className="flex flex-col">
                      <p className="text-[9px] text-[#4d4d4d] uppercase font-bold tracking-tight">Terakhir Diperbarui</p>
                      <p className="text-[11px] text-[#b3b3b3]">{formatDate(ticket.updated_at)}</p>
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
      <div className="hidden md:block bg-[#181818] border border-[#282828] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1f1f1f] border-b border-[#282828]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest w-[120px]">Kode</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest">Judul Laporan</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest w-[120px]">Kategori</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest w-[120px]">Prioritas</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest w-[140px]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16 bg-[#282828]" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-64 bg-[#282828]" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20 bg-[#282828]" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-16 bg-[#282828]" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20 bg-[#282828]" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto bg-[#282828]" /></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#666666]">Tidak ada tiket ditemukan</td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const priorityColor = getPriorityColor(ticket.priority);
                const statusColor = getStatusColor(ticket.status);
                return (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-[#1f1f1f] transition-colors cursor-pointer group"
                    onClick={() => router.push(`/mahasiswa/tiket/${ticket.id}`)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#666666]">{ticket.ticket_code}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white group-hover:text-[#1ed760] transition-colors line-clamp-1">{ticket.title}</span>
                        <span className="text-[10px] text-[#666666] mt-0.5">{timeAgo(ticket.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] text-[#b3b3b3]">{ticket.category}</span>
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
                      <button className="p-2 rounded-lg bg-[#282828] text-[#b3b3b3] group-hover:text-[#1ed760] transition-colors">
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
            className="p-2 rounded-lg bg-[#181818] border border-[#333333] text-[#b3b3b3] hover:text-white disabled:opacity-20"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-xs text-[#666666] font-medium uppercase tracking-widest">
            Halaman {currentPage} / {lastPage}
          </span>
          
          <button
            className="p-2 rounded-lg bg-[#181818] border border-[#333333] text-[#b3b3b3] hover:text-white disabled:opacity-20"
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