"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Ticket, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Users 
} from "lucide-react";

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await api.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const cards = [
    {
      title: "Total Tiket",
      value: stats?.total_tickets || 0,
      icon: Ticket,
      color: "text-[#539df5]",
      bgColor: "bg-[#539df5]/10",
      description: `${stats?.tickets_today || 0} tiket hari ini`,
    },
    {
      title: "Tiket Urgent",
      value: stats?.urgent_tickets || 0,
      icon: AlertCircle,
      color: "text-[#f3727f]",
      bgColor: "bg-red-500/10",
      description: "Butuh penanganan segera",
      pulse: true,
    },
    {
      title: "Dalam Proses",
      value: stats?.in_progress_tickets || 0,
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      description: `SLA: ${stats?.sla_compliance || 0}% terpenuhi`,
    },
    {
      title: "Selesai",
      value: stats?.resolved_tickets || 0,
      icon: CheckCircle2,
      color: "text-[#1ed760]",
      bgColor: "bg-[#1ed760]/10",
      description: `Rata-rata ${stats?.average_response_time || 0} jam respon`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-clean rounded-xl p-5 skeleton-pulse">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        : cards.map((card, index) => (
            <div key={index} className="card-hover rounded-xl p-5 group cursor-default">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold th-text-m uppercase tracking-wider">
                  {card.title}
                </p>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color} ${card.pulse ? "animate-pulse" : ""}`} />
                </div>
              </div>
              <p className="text-3xl font-bold th-text">
                {card.value.toLocaleString()}
              </p>
              <p className="text-xs th-text-m mt-1">
                {card.description}
              </p>
            </div>
          ))}
    </div>
  );
}