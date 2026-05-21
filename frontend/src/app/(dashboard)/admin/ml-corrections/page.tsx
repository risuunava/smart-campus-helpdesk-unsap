"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Ticket } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getPriorityColor, formatDate, timeAgo } from "@/lib/utils";
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Loader2,
  Cpu
} from "lucide-react";

export default function MLCorrectionsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [correctionNote, setCorrectionNote] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState({
    totalPredictions: 0,
    correctedCount: 0,
    accuracy: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTicketsWithML();
  }, []);

  async function fetchTicketsWithML() {
    try {
      // Fetch tickets that have ML predictions
      const response = await api.getTickets({
        per_page: 50,
        status: "all",
      });

      const mlTickets = response.data.data.filter(
        (t) => t.priority_source === "ml_prediction" || t.priority_source === "keyword_override"
      );

      setTickets(mlTickets);
      
      // Calculate stats
      const corrected = mlTickets.filter((t) => t.priority_source === "manual").length;
      setStats({
        totalPredictions: mlTickets.length,
        correctedCount: corrected,
        accuracy: mlTickets.length > 0 
          ? Math.round(((mlTickets.length - corrected) / mlTickets.length) * 100) 
          : 100,
      });
    } catch (error) {
      console.error("Failed to fetch ML tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCorrectML(ticketId: number, correctPriority: string) {
    setIsSaving({ ...isSaving, [ticketId]: true });
    
    try {
      await api.correctMLLabel(
        ticketId,
        correctPriority,
        correctionNote[ticketId] || undefined
      );

      toast({
        title: "Koreksi Berhasil",
        description: `Tiket #${ticketId} dikoreksi menjadi ${correctPriority}. Data disimpan untuk training ulang.`,
      });

      // Refresh data
      fetchTicketsWithML();
      
      // Clear correction note
      setCorrectionNote({ ...correctionNote, [ticketId]: "" });
    } catch (error) {
      toast({
        title: "Koreksi Gagal",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving({ ...isSaving, [ticketId]: false });
    }
  }

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold th-text flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-500" />
            AI Active Learning
          </h1>
          <p className="th-text-2 mt-1">
            Koreksi label prediksi ML untuk meningkatkan akurasi model
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-clean rounded-2xl p-5 hover:th-border-s transition-all">
          <p className="text-xs font-bold th-text-m uppercase tracking-wider mb-3">Total Prediksi ML</p>
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-purple-500" />
            <span className="text-4xl font-black tracking-tighter th-text">{stats.totalPredictions}</span>
          </div>
          <p className="text-[11px] th-text-2 mt-3 font-mono font-bold uppercase tracking-wider bg-th-sunken inline-block px-2 py-1 rounded border th-border">
            Total tiket berlabel AI
          </p>
        </div>

        <div className="card-clean rounded-2xl p-5 hover:th-border-s transition-all">
          <p className="text-xs font-bold th-text-m uppercase tracking-wider mb-3">Akurasi Model</p>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-[#1ed760]" />
            <span className="text-4xl font-black tracking-tighter text-[#1ed760]">{stats.accuracy}%</span>
          </div>
          <p className="text-[11px] th-text-2 mt-3 font-mono font-bold uppercase tracking-wider bg-th-sunken inline-block px-2 py-1 rounded border th-border">
            {stats.correctedCount} koreksi manual
          </p>
        </div>

        <div className="card-clean rounded-2xl p-5 hover:th-border-s transition-all">
          <p className="text-xs font-bold th-text-m uppercase tracking-wider mb-3">Siap Training</p>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-[#ffa42b]" />
            <span className="text-4xl font-black tracking-tighter text-[#ffa42b]">{stats.correctedCount}</span>
          </div>
          <p className="text-[11px] th-text-2 mt-3 font-mono font-bold uppercase tracking-wider bg-th-sunken inline-block px-2 py-1 rounded border th-border">
            Data koreksi dikumpulkan
          </p>
        </div>
      </div>

      {/* Tickets with ML Predictions */}
      <div className="card-clean rounded-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b th-border-s bg-th-base/50">
          <h3 className="text-lg font-bold th-text flex items-center gap-2">
            Tiket dengan Prediksi ML
          </h3>
          <p className="text-sm th-text-2 mt-1">Koreksi label yang tidak sesuai untuk meningkatkan akurasi AI</p>
        </div>
        <div className="p-6 bg-th-base">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full skeleton-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 bg-th-sunken rounded-2xl border th-border">
              <Brain className="h-16 w-16 th-text-f mx-auto mb-4 opacity-50" />
              <p className="th-text-2 font-medium">Belum ada tiket dengan prediksi ML yang perlu direview</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const priorityColor = getPriorityColor(ticket.priority);
                const isCorrected = ticket.priority_source === "manual";
                
                return (
                  <div
                    key={ticket.id}
                    className={`border rounded-xl p-5 transition-all ${
                      isCorrected 
                        ? "border-[#1ed760]/30 bg-[#1ed760]/5" 
                        : "th-border bg-th-raised shadow-sm hover:shadow"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-mono text-xs font-bold th-text-m">
                            {ticket.ticket_code}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isCorrected 
                              ? "bg-th-base th-text-2 border-th-border" 
                              : "bg-purple-500/10 text-purple-500 border-purple-500/30"
                          }`}>
                            {isCorrected ? "Dikoreksi" : "ML Prediction"}
                          </span>
                          {ticket.priority_source === "keyword_override" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-500 border-amber-500/30">
                              Keyword Override
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold th-text mb-1">{ticket.title}</h3>
                        <p className="text-sm th-text-2 line-clamp-2 mb-3 leading-relaxed">
                          {ticket.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-mono font-bold th-text-m uppercase tracking-wider">
                          <span className="flex items-center">Prediksi: 
                            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}>
                              {ticket.priority}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                             Conf: <span className={ticket.ml_confidence_score && ticket.ml_confidence_score > 0.7 ? "text-[#1ed760]" : "text-[#ffa42b]"}>{ticket.ml_confidence_score !== undefined && ticket.ml_confidence_score !== null ? (ticket.ml_confidence_score * 100).toFixed(0) : 0}%</span>
                          </span>
                          <span>{timeAgo(ticket.created_at)}</span>
                        </div>
                      </div>

                      {/* Correction Actions */}
                      {!isCorrected && (
                        <div className="md:ml-6 space-y-3 w-full md:w-[240px] shrink-0 border-t md:border-t-0 md:border-l th-border-s pt-4 md:pt-0 md:pl-6">
                          <p className="text-[10px] font-bold th-text-m uppercase tracking-wider mb-2">Koreksi Label (Jika Salah):</p>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              className="py-2 rounded text-[11px] font-bold transition-all border border-[#f3727f]/30 text-[#f3727f] bg-th-base hover:bg-[#f3727f]/10 disabled:opacity-50"
                              onClick={() => handleCorrectML(ticket.id, "urgent")}
                              disabled={isSaving[ticket.id]}
                            >
                              {isSaving[ticket.id] ? (
                                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                              ) : (
                                "Urgent"
                              )}
                            </button>
                            <button
                              className="py-2 rounded text-[11px] font-bold transition-all border border-[#ffa42b]/30 text-[#ffa42b] bg-th-base hover:bg-[#ffa42b]/10 disabled:opacity-50"
                              onClick={() => handleCorrectML(ticket.id, "normal")}
                              disabled={isSaving[ticket.id]}
                            >
                              Normal
                            </button>
                            <button
                              className="py-2 rounded text-[11px] font-bold transition-all border border-[#1ed760]/30 text-[#1ed760] bg-th-base hover:bg-[#1ed760]/10 disabled:opacity-50"
                              onClick={() => handleCorrectML(ticket.id, "low")}
                              disabled={isSaving[ticket.id]}
                            >
                              Low
                            </button>
                          </div>
                          <input
                            placeholder="Catatan alasan koreksi (opsional)"
                            value={correctionNote[ticket.id] || ""}
                            onChange={(e) =>
                              setCorrectionNote({
                                ...correctionNote,
                                [ticket.id]: e.target.value,
                              })
                            }
                            className="w-full h-9 px-3 text-xs bg-th-base border th-border th-text placeholder:text-[#666666] rounded-md focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                          />
                        </div>
                      )}

                      {isCorrected && (
                        <div className="ml-6 flex items-center justify-center bg-[#1ed760]/10 h-12 w-12 rounded-full shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-[#1ed760]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}