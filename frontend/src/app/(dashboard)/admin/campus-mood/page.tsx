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
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";

const sentimentChartConfig = {
  sentiment: {
    label: "Skor Sentimen",
    color: "#1ed760",
  },
} satisfies ChartConfig;

const ticketDistributionConfig = {
  low: {
    label: "Low (Aman)",
    color: "#1ed760",
  },
  normal: {
    label: "Normal",
    color: "#ffa42b",
  },
  urgent: {
    label: "Urgent (Kritis)",
    color: "#f3727f",
  },
} satisfies ChartConfig;

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
            Analisis visual sentimen dan tren laporan mahasiswa
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Trend Chart */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl overflow-hidden">
          <div className="px-6 pt-6 pb-2 border-b border-[#282828]">
            <h3 className="text-lg font-bold text-white">Tren Sentimen</h3>
            <p className="text-sm text-[#b3b3b3]">Skor kebahagiaan kampus (0-100)</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full bg-[#282828]" />
            ) : moodData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-[#666666]">Belum ada data</div>
            ) : (
              <ChartContainer config={sentimentChartConfig} className="min-h-[250px] w-full">
                <LineChart accessibilityLayer data={moodData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={true} horizontal={true} stroke="#2a2a2a" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="#888888"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <ChartTooltip cursor={{ stroke: '#333', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <Line
                    type="linear"
                    dataKey="sentiment_score"
                    name="Skor Sentimen"
                    stroke="var(--color-sentiment)"
                    strokeWidth={2.5}
                    dot={{ fill: '#181818', stroke: 'var(--color-sentiment)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--color-sentiment)', stroke: '#181818', strokeWidth: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </div>

        {/* Ticket Distribution Chart */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl overflow-hidden">
          <div className="px-6 pt-6 pb-2 border-b border-[#282828]">
            <h3 className="text-lg font-bold text-white">Distribusi Tiket</h3>
            <p className="text-sm text-[#b3b3b3]">Berdasarkan tingkat prioritas laporan</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full bg-[#282828]" />
            ) : moodData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-[#666666]">Belum ada data</div>
            ) : (
              <ChartContainer config={ticketDistributionConfig} className="min-h-[250px] w-full">
                <BarChart accessibilityLayer data={moodData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} horizontal={true} stroke="#2a2a2a" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} cursor={{ fill: '#282828', opacity: 0.4 }} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="low" fill="var(--color-low)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="normal" fill="var(--color-normal)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="urgent" fill="var(--color-urgent)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-[#181818] border border-[#282828] rounded-xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-[#282828]">
          <h3 className="text-lg font-bold text-white">Rincian Data Bulanan</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#282828]" />
              ))}
            </div>
          ) : moodData.length === 0 ? (
            <p className="text-center text-[#666666] py-4">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {moodData.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${getSentimentBg(item.sentiment_score)} transition-all hover:bg-[#1f1f1f] gap-4`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 text-center">
                      {getSentimentEmoji(item.sentiment_score)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.month}</h4>
                      <p className={`text-xs font-bold ${getSentimentColor(item.sentiment_score)}`}>
                        Skor: {item.sentiment_score}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3 py-1.5 rounded-lg bg-[#121212] border border-[#282828] text-center min-w-[80px]">
                      <p className="text-[10px] text-[#b3b3b3] uppercase">Urgent</p>
                      <p className="font-bold text-[#f3727f]">{item.urgent}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-[#121212] border border-[#282828] text-center min-w-[80px]">
                      <p className="text-[10px] text-[#b3b3b3] uppercase">Normal</p>
                      <p className="font-bold text-[#ffa42b]">{item.normal}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-[#121212] border border-[#282828] text-center min-w-[80px]">
                      <p className="text-[10px] text-[#b3b3b3] uppercase">Low</p>
                      <p className="font-bold text-[#1ed760]">{item.low}</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-lg bg-[#1ed760]/10 border border-[#1ed760]/20 text-center min-w-[80px]">
                      <p className="text-[10px] text-[#1ed760] uppercase">Total</p>
                      <p className="font-bold text-[#1ed760]">{item.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}