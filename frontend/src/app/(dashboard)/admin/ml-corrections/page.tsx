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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-400" />
            AI Active Learning
          </h1>
          <p className="text-[#b3b3b3]">
            Koreksi label prediksi ML untuk meningkatkan akurasi model
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all hover:bg-[#1f1f1f]">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">Total Prediksi ML</p>
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-purple-400" />
            <span className="text-3xl font-bold text-white">{stats.totalPredictions}</span>
          </div>
        </div>

        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all hover:bg-[#1f1f1f]">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">Akurasi Model</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#1ed760]" />
            <span className="text-3xl font-bold text-[#1ed760]">{stats.accuracy}%</span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            {stats.correctedCount} koreksi manual
          </p>
        </div>

        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 transition-all hover:bg-[#1f1f1f]">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">Siap Training</p>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#ffa42b]" />
            <span className="text-3xl font-bold text-[#ffa42b]">{stats.correctedCount}</span>
          </div>
          <p className="text-xs text-[#666666] mt-1">Data koreksi siap untuk training</p>
        </div>
      </div>

      {/* Tickets with ML Predictions */}
      <div className="bg-[#181818] border border-[#282828] rounded-xl">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Tiket dengan Prediksi ML
          </h3>
          <p className="text-sm text-[#b3b3b3]">Koreksi label yang tidak sesuai untuk meningkatkan akurasi AI</p>
        </div>
        <div className="px-6 pb-6 mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full bg-[#282828]" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-[#4d4d4d] mx-auto mb-4" />
              <p className="text-[#666666]">Belum ada tiket dengan prediksi ML</p>
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
                        : "border-[#282828] bg-[#1f1f1f]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-[#666666]">
                            {ticket.ticket_code}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isCorrected 
                              ? "bg-[#1f1f1f] text-[#666666] border-[#4d4d4d]" 
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}>
                            {isCorrected ? "Dikoreksi" : "ML Prediction"}
                          </span>
                          {ticket.priority_source === "keyword_override" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-500/10 text-amber-400 border-amber-500/20">
                              Keyword Override
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-white mb-1">{ticket.title}</h3>
                        <p className="text-sm text-[#b3b3b3] line-clamp-2 mb-2">
                          {ticket.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-[#666666]">
                          <span className="flex items-center">Prediksi: 
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border}`}>
                              {ticket.priority}
                            </span>
                          </span>
                          <span>Confidence: {ticket.ml_confidence_score !== undefined && ticket.ml_confidence_score !== null ? (ticket.ml_confidence_score * 100).toFixed(0) : 0}%</span>
                          <span>{timeAgo(ticket.created_at)}</span>
                        </div>
                      </div>

                      {/* Correction Actions */}
                      {!isCorrected && (
                        <div className="ml-6 space-y-2">
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#f3727f]/30 text-[#f3727f] hover:bg-[#f3727f]/10 disabled:opacity-50"
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
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#ffa42b]/30 text-[#ffa42b] hover:bg-[#ffa42b]/10 disabled:opacity-50"
                              onClick={() => handleCorrectML(ticket.id, "normal")}
                              disabled={isSaving[ticket.id]}
                            >
                              Normal
                            </button>
                            <button
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#b3b3b3]/30 text-[#b3b3b3] hover:bg-[#b3b3b3]/10 hover:text-white disabled:opacity-50"
                              onClick={() => handleCorrectML(ticket.id, "low")}
                              disabled={isSaving[ticket.id]}
                            >
                              Low
                            </button>
                          </div>
                          <input
                            placeholder="Catatan koreksi (opsional)"
                            value={correctionNote[ticket.id] || ""}
                            onChange={(e) =>
                              setCorrectionNote({
                                ...correctionNote,
                                [ticket.id]: e.target.value,
                              })
                            }
                            className="w-full h-8 px-3 text-xs bg-[#1f1f1f] border border-[#4d4d4d] text-white placeholder:text-[#666666] rounded-md focus:ring-1 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all"
                          />
                        </div>
                      )}

                      {isCorrected && (
                        <div className="ml-6">
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