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
import { useTheme } from "next-themes";

const sentimentChartConfig = {
  sentiment: {
    label: "Skor Sentimen",
    color: "#1ed760",
  },
} satisfies ChartConfig;

const ticketDistributionConfig = {
  low: {
    label: "Low",
    color: "#1ed760",
  },
  normal: {
    label: "Normal",
    color: "#ffa42b",
  },
  urgent: {
    label: "Urgent",
    color: "#f3727f",
  },
} satisfies ChartConfig;

export default function CampusMoodPage() {
  const [moodData, setMoodData] = useState<CampusMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("6_months");
  const { theme } = useTheme();
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
    if (score >= 70) return "bg-[#1ed760]/10 border-[#1ed760]/30";
    if (score >= 40) return "bg-[#ffa42b]/10 border-[#ffa42b]/30";
    return "bg-[#f3727f]/10 border-[#f3727f]/30";
  }

  // Dynamic cartesian grid color based on theme
  const gridColor = theme === 'light' ? '#e5e5e5' : '#2a2a2a';
  const tooltipCursorColor = theme === 'light' ? '#f0f0f0' : '#333';

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold th-text flex items-center gap-2">
            Campus Mood Analytics
          </h1>
          <p className="th-text-2 mt-1">
            Analisis visual sentimen dan tren laporan mahasiswa
          </p>
        </div>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 th-text-m pointer-events-none" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full sm:w-[180px] appearance-none bg-th-base border th-border th-text rounded-lg pl-10 pr-8 py-2.5 text-sm focus:ring-1 focus:ring-[#1ed760]/50 focus:border-[#1ed760] outline-none transition-all cursor-pointer shadow-sm"
          >
            <option value="3_months">3 Bulan Terakhir</option>
            <option value="6_months">6 Bulan Terakhir</option>
            <option value="12_months">12 Bulan Terakhir</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-clean rounded-2xl p-5 hover:th-border-s transition-all">
          <p className="text-xs font-bold th-text-m uppercase tracking-wider mb-3">Sentimen Rata-rata</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getSentimentEmoji(summary.averageSentiment)}
              <span className={`text-4xl font-black tracking-tighter ${getSentimentColor(summary.averageSentiment)}`}>
                {summary.averageSentiment}%
              </span>
            </div>
            <div className="p-2.5 bg-th-raised border th-border-s rounded-full">
              {summary.trend === "up" && <TrendingUp className="h-5 w-5 text-[#1ed760]" />}
              {summary.trend === "down" && <TrendingDown className="h-5 w-5 text-[#f3727f]" />}
              {summary.trend === "stable" && <Minus className="h-5 w-5 th-text-m" />}
            </div>
          </div>
          <p className="text-[11px] th-text-2 mt-3 font-mono font-bold uppercase tracking-wider bg-th-sunken inline-block px-2 py-1 rounded border th-border">
            {summary.trend === "up" ? "↑ Membaik" : summary.trend === "down" ? "↓ Menurun" : "→ Stabil"}
          </p>
        </div>

        <div className="card-clean rounded-2xl p-5 hover:th-border-s transition-all">
          <p className="text-xs font-bold th-text-m uppercase tracking-wider mb-3">Total Tiket</p>
          <p className="text-4xl font-black tracking-tighter th-text">{summary.totalTickets}</p>
          <p className="text-[11px] th-text-2 mt-3 font-mono font-bold uppercase tracking-wider bg-th-sunken inline-block px-2 py-1 rounded border th-border">
            Dalam periode ini
          </p>
        </div>

        <div className="card-clean rounded-2xl p-5 hover:th-border-s transition-all">
          <p className="text-xs font-bold th-text-m uppercase tracking-wider mb-3">Tiket Urgent</p>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-7 w-7 text-[#f3727f]" />
            <span className="text-4xl font-black tracking-tighter text-[#f3727f]">{summary.urgentPercentage}%</span>
          </div>
          <p className="text-[11px] th-text-2 mt-3 font-mono font-bold uppercase tracking-wider bg-th-sunken inline-block px-2 py-1 rounded border th-border">
            Dari total laporan
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Trend Chart */}
        <div className="card-clean rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b th-border-s bg-th-base/50">
            <h3 className="text-lg font-bold th-text">Tren Sentimen</h3>
            <p className="text-sm th-text-2">Skor kebahagiaan kampus (0-100)</p>
          </div>
          <div className="p-6 bg-th-base">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full skeleton-pulse" />
            ) : moodData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center th-text-m font-medium bg-th-sunken rounded-xl border th-border">Belum ada data</div>
            ) : (
              <ChartContainer config={sentimentChartConfig} className="min-h-[250px] w-full">
                <LineChart accessibilityLayer data={moodData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} horizontal={true} stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="var(--th-text-m)"
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="var(--th-text-m)"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <ChartTooltip cursor={{ stroke: tooltipCursorColor, strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <Line
                    type="monotone"
                    dataKey="sentiment_score"
                    name="Skor Sentimen"
                    stroke="var(--color-sentiment)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--th-base)', stroke: 'var(--color-sentiment)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--color-sentiment)', stroke: 'var(--th-base)', strokeWidth: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </div>

        {/* Ticket Distribution Chart */}
        <div className="card-clean rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b th-border-s bg-th-base/50">
            <h3 className="text-lg font-bold th-text">Distribusi Tiket</h3>
            <p className="text-sm th-text-2">Berdasarkan tingkat prioritas laporan</p>
          </div>
          <div className="p-6 bg-th-base">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full skeleton-pulse" />
            ) : moodData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center th-text-m font-medium bg-th-sunken rounded-xl border th-border">Belum ada data</div>
            ) : (
              <ChartContainer config={ticketDistributionConfig} className="min-h-[250px] w-full">
                <BarChart accessibilityLayer data={moodData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} horizontal={true} stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="var(--th-text-m)"
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    stroke="var(--th-text-m)"
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} cursor={{ fill: tooltipCursorColor, opacity: 0.8 }} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="low" fill="var(--color-low)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="normal" fill="var(--color-normal)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="urgent" fill="var(--color-urgent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card-clean rounded-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b th-border-s bg-th-base/50">
          <h3 className="text-lg font-bold th-text">Rincian Data Bulanan</h3>
        </div>
        <div className="p-6 bg-th-base">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full skeleton-pulse" />
              ))}
            </div>
          ) : moodData.length === 0 ? (
            <p className="text-center th-text-2 font-medium py-4">Belum ada data</p>
          ) : (
            <div className="space-y-4">
              {moodData.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border ${getSentimentBg(item.sentiment_score)} transition-all hover:shadow-md gap-4`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-full border border-black/5 dark:border-white/5">
                      {getSentimentEmoji(item.sentiment_score)}
                    </div>
                    <div>
                      <h4 className="font-bold th-text text-base">{item.month}</h4>
                      <p className={`text-xs font-bold uppercase tracking-wider ${getSentimentColor(item.sentiment_score)} mt-0.5`}>
                        Skor: {item.sentiment_score}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3 py-2 rounded-lg bg-th-base border th-border text-center min-w-[85px] shadow-sm">
                      <p className="text-[10px] font-bold th-text-m uppercase tracking-wider">Urgent</p>
                      <p className="font-black text-[#f3727f] text-lg leading-none mt-1">{item.urgent}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-th-base border th-border text-center min-w-[85px] shadow-sm">
                      <p className="text-[10px] font-bold th-text-m uppercase tracking-wider">Normal</p>
                      <p className="font-black text-[#ffa42b] text-lg leading-none mt-1">{item.normal}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-th-base border th-border text-center min-w-[85px] shadow-sm">
                      <p className="text-[10px] font-bold th-text-m uppercase tracking-wider">Low</p>
                      <p className="font-black text-[#1ed760] text-lg leading-none mt-1">{item.low}</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[#1ed760]/10 border border-[#1ed760]/30 text-center min-w-[85px] shadow-sm ml-auto md:ml-2">
                      <p className="text-[10px] font-bold text-[#1ed760] uppercase tracking-wider">Total</p>
                      <p className="font-black text-[#1ed760] text-lg leading-none mt-1">{item.total}</p>
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