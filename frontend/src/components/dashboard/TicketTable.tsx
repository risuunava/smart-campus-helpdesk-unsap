"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Ticket, TicketPriority, TicketStatus } from "@/types";
import { formatDate, timeAgo, getPriorityColor, getStatusColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

export function TicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getTickets({
        page: currentPage,
        per_page: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: search || undefined,
      });

      setTickets(response.data.data);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, priorityFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
          <input
            placeholder="Cari tiket berdasarkan judul atau kode..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="appearance-none bg-[#1f1f1f] border border-[#4d4d4d] text-white rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none w-[160px] cursor-pointer peer"
          >
            <option value="all">Semua Status</option>
            <option value="open">Terbuka</option>
            <option value="in_progress">Diproses</option>
            <option value="resolved">Selesai</option>
            <option value="closed">Ditutup</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b3b3b3] pointer-events-none transition-transform duration-300 peer-focus:rotate-180" />
        </div>
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="appearance-none bg-[#1f1f1f] border border-[#4d4d4d] text-white rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none w-[160px] cursor-pointer peer"
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b3b3b3] pointer-events-none transition-transform duration-300 peer-focus:rotate-180" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#282828] bg-[#181818] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1f1f1f] border-b border-[#282828] hover:bg-[#1f1f1f]">
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider w-[100px]">Kode Tiket</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider">Judul</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider">Pelapor</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider">Kategori</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider">Prioritas</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider">Tanggal</TableHead>
              <TableHead className="text-[#b3b3b3] font-semibold text-xs uppercase tracking-wider text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-[#282828]">
                  <TableCell><Skeleton className="h-4 w-20 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-[#282828]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 bg-[#282828]" /></TableCell>
                </TableRow>
              ))
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-[#666666]">
                  Tidak ada tiket ditemukan
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const priorityColor = getPriorityColor(ticket.priority);
                const statusColor = getStatusColor(ticket.status);
                
                return (
                  <TableRow
                    key={ticket.id}
                    className={`border-b border-[#282828] cursor-pointer transition-colors hover:bg-[#1f1f1f] ${
                      ticket.priority === "urgent" ? "bg-red-500/5" : ""
                    }`}
                    onClick={() => router.push(`/admin/tiket/${ticket.id}`)}
                  >
                    <TableCell className="font-mono text-xs text-[#666666]">
                      {ticket.ticket_code}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        {ticket.priority === "urgent" && (
                          <AlertCircle className="h-4 w-4 text-[#f3727f] flex-shrink-0" />
                        )}
                        <span className="line-clamp-1">{ticket.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#b3b3b3]">
                      {ticket.is_anonymous ? (
                        <span className="text-[#666666] italic">
                          {ticket.anonymous_code}
                        </span>
                      ) : (
                        ticket.user?.name || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#b3b3b3] bg-[#1f1f1f] px-2.5 py-1 rounded-full border border-[#282828]">
                        {ticket.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border} uppercase tracking-wider`}>
                        {ticket.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                        {statusColor.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-[#666666]">
                      {timeAgo(ticket.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        className="p-2 rounded-lg bg-[#282828] text-[#b3b3b3] hover:text-[#1ed760] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/tiket/${ticket.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-xs text-[#666666] font-medium uppercase tracking-widest">
          {total} Tiket ditemukan
        </p>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-[#181818] border border-[#333333] text-[#b3b3b3] hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-[#666666] font-bold px-2 uppercase tracking-widest">
            {currentPage} / {lastPage}
          </span>
          <button
            className="p-2 rounded-lg bg-[#181818] border border-[#333333] text-[#b3b3b3] hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1"
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}