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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tiket Saya</h1>
          <p className="text-[#b3b3b3]">Total: {total} tiket</p>
        </div>
        <Link href="/mahasiswa/buat-laporan">
          <button className="btn-gradient px-5 py-2.5 text-sm flex items-center gap-2 uppercase tracking-wider">
            <Plus className="h-4 w-4" />
            Buat Laporan
          </button>
        </Link>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
          <input
            placeholder="Cari tiket berdasarkan judul atau kode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-[180px]">
            <Select 
              value={sortBy} 
              onValueChange={(val) => { setSortBy(val); setCurrentPage(1); }}
            >
              <SelectTrigger className="bg-[#1f1f1f] border-[#4d4d4d] text-white rounded-xl">
                <Filter className="h-4 w-4 mr-2 text-[#666666]" />
                <SelectValue placeholder="Urutkan..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-[#282828] text-white">
                <SelectItem value="created_at">Tanggal Dibuat</SelectItem>
                <SelectItem value="priority">Prioritas</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Judul</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2.5 bg-[#1f1f1f] border border-[#4d4d4d] text-[#b3b3b3] hover:text-white rounded-xl transition-all"
            title={sortOrder === "asc" ? "Urutan Menurun" : "Urutan Menaik"}
          >
            <ArrowUpDown className={`h-4 w-4 transition-transform duration-300 ${sortOrder === "asc" ? "" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#181818] border border-[#282828] rounded-xl p-5">
              <Skeleton className="h-4 w-3/4 mb-2 bg-[#282828]" />
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
                className="bg-[#181818] border border-[#282828] rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-[#1f1f1f] hover:border-[#3a3a3a] group"
                onClick={() => router.push(`/mahasiswa/tiket/${ticket.id}`)}
              >
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
                    <p className="text-sm text-[#666666] line-clamp-2 mt-1">{ticket.description}</p>
                    <p className="text-xs text-[#4d4d4d] mt-2">{formatDate(ticket.created_at)}</p>
                  </div>
                  <Eye className="h-5 w-5 text-[#4d4d4d] group-hover:text-[#1ed760] transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            className="px-4 py-2 rounded-full text-sm bg-[#1f1f1f] border border-[#4d4d4d] text-[#b3b3b3] hover:text-white hover:border-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>
          <span className="text-sm text-[#b3b3b3]">
            Halaman {currentPage} dari {lastPage}
          </span>
          <button
            className="px-4 py-2 rounded-full text-sm bg-[#1f1f1f] border border-[#4d4d4d] text-[#b3b3b3] hover:text-white hover:border-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}