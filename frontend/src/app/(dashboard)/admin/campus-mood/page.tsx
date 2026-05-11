"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CampusMood } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  CalendarDays
} from "lucide-react";

export default function CampusMoodPage() {
  const [moodData, setMoodData] = useState<CampusMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("6_months");
  const [summary, setSummary] = useState({
    averageSentiment: 0,
    trend: "stable" as "up" | "down" | "stable",
    totalTickets: 0,
    urgentPercentage: 0,
  });

  useEffect(() => {
    fetchCampusMood();
  }, [period]);

  async function fetchCampusMood() {
    setIsLoading(true);
    try {
      const response = await api.getCampusMood(period);
      setMoodData(response.data);
      calculateSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch campus mood:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function calculateSummary(data: CampusMood[]) {
    if (data.length === 0) return;

    const totalTickets = data.reduce((sum, d) => sum + d.total, 0);
    const totalUrgent = data.reduce((sum, d) => sum + d.urgent, 0);
    const avgSentiment = data.reduce((sum, d) => sum + d.sentiment_score, 0) / data.length;

    // Calculate trend
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.length ? firstHalf.reduce((sum, d) => sum + d.sentiment_score, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length ? secondHalf.reduce((sum, d) => sum + d.sentiment_score, 0) / secondHalf.length : 0;

    setSummary({
      averageSentiment: Math.round(avgSentiment),
      trend: secondAvg > firstAvg ? "up" : secondAvg < firstAvg ? "down" : "stable",
      totalTickets,
      urgentPercentage: totalTickets ? Math.round((totalUrgent / totalTickets) * 100) : 0,
    });
  }

  function getSentimentEmoji(score: number) {
    if (score >= 70) return <Smile className="h-6 w-6 text-[#1ed760]" />;
    if (score >= 40) return <Meh className="h-6 w-6 text-[#ffa42b]" />;
    return <Frown className="h-6 w-6 text-[#f3727f]" />;
  }

  function getSentimentColor(score: number) {
    if (score >= 70) return "text-[#1ed760]";
    if (score >= 40) return "text-[#ffa42b]";
    return "text-[#f3727f]";
  }

  function getSentimentBg(score: number) {
    if (score >= 70) return "bg-[#1ed760]/10 border-[#1ed760]/20";
    if (score >= 40) return "bg-[#ffa42b]/10 border-[#ffa42b]/20";
    return "bg-[#f3727f]/10 border-[#f3727f]/20";
  }

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Campus Mood Analytics
          </h1>
          <p className="text-[#b3b3b3] mt-1">
            Analisis sentimen dan tren laporan mahasiswa
          </p>
        </div>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666] pointer-events-none" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full sm:w-[180px] appearance-none bg-[#1f1f1f] border border-[#4d4d4d] text-white rounded-lg pl-10 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-[#1ed760]/40 focus:border-[#1ed760] outline-none transition-all cursor-pointer"
          >
            <option value="3_months">3 Bulan Terakhir</option>
            <option value="6_months">6 Bulan Terakhir</option>
            <option value="12_months">12 Bulan Terakhir</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 hover:bg-[#1f1f1f] transition-all">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-3">Sentimen Rata-rata</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSentimentEmoji(summary.averageSentiment)}
              <span className={`text-3xl font-bold ${getSentimentColor(summary.averageSentiment)}`}>
                {summary.averageSentiment}%
              </span>
            </div>
            <div className="p-2 bg-[#252525] rounded-full">
              {summary.trend === "up" && <TrendingUp className="h-5 w-5 text-[#1ed760]" />}
              {summary.trend === "down" && <TrendingDown className="h-5 w-5 text-[#f3727f]" />}
              {summary.trend === "stable" && <Minus className="h-5 w-5 text-[#666666]" />}
            </div>
          </div>
          <p className="text-xs text-[#666666] mt-2 font-mono">
            {summary.trend === "up" ? "↑ Membaik" : summary.trend === "down" ? "↓ Menurun" : "→ Stabil"}
          </p>
        </div>

        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 hover:bg-[#1f1f1f] transition-all">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-3">Total Tiket</p>
          <p className="text-3xl font-bold text-white">{summary.totalTickets}</p>
          <p className="text-xs text-[#666666] mt-2 font-mono">Dalam periode ini</p>
        </div>

        <div className="bg-[#181818] border border-[#282828] rounded-xl p-5 hover:bg-[#1f1f1f] transition-all">
          <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-3">Tiket Urgent</p>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-[#f3727f]" />
            <span className="text-3xl font-bold text-[#f3727f]">{summary.urgentPercentage}%</span>
          </div>
          <p className="text-xs text-[#666666] mt-2 font-mono">Dari total tiket</p>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="bg-[#181818] border border-[#282828] rounded-xl">
        <div className="px-6 pt-6 pb-2 border-b border-[#282828]">
          <h3 className="text-lg font-bold text-white">Tren Sentimen Bulanan</h3>
          <p className="text-sm text-[#b3b3b3] mb-4">Skor sentimen berdasarkan distribusi prioritas tiket (0-100)</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full bg-[#282828]" />
              ))}
            </div>
          ) : moodData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#666666]">Belum ada data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodData.map((item, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl border ${getSentimentBg(item.sentiment_score)} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white w-24">{item.month}</span>
                      {getSentimentEmoji(item.sentiment_score)}
                      <span className={`font-bold ${getSentimentColor(item.sentiment_score)} text-lg`}>
                        {item.sentiment_score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#f3727f]/10 text-[#f3727f] border border-[#f3727f]/20">
                        {item.urgent} Urgent
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#ffa42b]/10 text-[#ffa42b] border border-[#ffa42b]/20">
                        {item.normal} Normal
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/20">
                        {item.low} Low
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-[#282828] rounded-full h-3 overflow-hidden mt-1">
                    <div className="flex h-full">
                      <div
                        className="bg-[#f3727f] h-full transition-all duration-500"
                        style={{ width: `${item.total > 0 ? (item.urgent / item.total) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-[#ffa42b] h-full transition-all duration-500"
                        style={{ width: `${item.total > 0 ? (item.normal / item.total) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-[#1ed760] h-full transition-all duration-500"
                        style={{ width: `${item.total > 0 ? (item.low / item.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-[#b3b3b3] mt-2 font-mono">
                    <span>Total: {item.total} tiket</span>
                    <span>
                      {item.sentiment_score >= 70
                        ? "Suasana kampus kondusif"
                        : item.sentiment_score >= 40
                        ? "Ada beberapa keluhan"
                        : "Banyak keluhan serius"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-[#181818] border border-[#282828] rounded-xl p-4">
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#f3727f] rounded-sm" />
            <span className="text-[#b3b3b3]">Urgent (Skor 0-33)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ffa42b] rounded-sm" />
            <span className="text-[#b3b3b3]">Normal (Skor 34-66)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1ed760] rounded-sm" />
            <span className="text-[#b3b3b3]">Low (Skor 67-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
}