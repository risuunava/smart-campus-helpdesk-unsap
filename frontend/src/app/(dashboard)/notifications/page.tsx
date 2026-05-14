"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification, NotificationType } from "@/types";
import {
  Bell,
  CheckCheck,
  Trash2,
  Ticket,
  MessageSquare,
  User,
  Lock,
  Camera,
  ShieldCheck,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─── icon & warna per tipe ───────────────────────────────────────────────
const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  ticket_created: {
    icon: <Ticket className="w-4 h-4" />,
    color: "text-[#1ed760]",
    bg: "bg-[#1ed760]/10",
  },
  ticket_status_changed: {
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  chat_received: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  profile_updated: {
    icon: <User className="w-4 h-4" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  password_changed: {
    icon: <Lock className="w-4 h-4" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  avatar_updated: {
    icon: <Camera className="w-4 h-4" />,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
};

function NotifCard({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const cfg = typeConfig[notif.type] ?? typeConfig.profile_updated;
  const isUnread = !notif.read_at;

  const ticketLink =
    notif.ticket_id
      ? `/mahasiswa/tiket/${notif.ticket_id}`
      : null;

  const timeAgo = formatDistanceToNow(new Date(notif.created_at), {
    addSuffix: true,
    locale: idLocale,
  });

  const content = (
    <div
      className={`flex gap-3 p-4 rounded-xl border transition-all group ${
        isUnread
          ? "border-[#1ed760]/20 bg-[#1ed760]/5"
          : "border-[#282828] bg-[#1a1a1a]"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.color}`}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${isUnread ? "text-white" : "text-gray-300"}`}>
            {notif.title}
            {isUnread && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#1ed760] align-middle" />
            )}
          </p>
          <span className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">{timeAgo}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {isUnread && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRead(notif.id); }}
            title="Tandai dibaca"
            className="p-1 text-gray-500 hover:text-[#1ed760] transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notif.id); }}
          title="Hapus"
          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // Wrap with Link if ada ticket terkait
  if (ticketLink && isUnread) {
    return (
      <Link href={ticketLink} onClick={() => onRead(notif.id)}>
        {content}
      </Link>
    );
  }
  if (ticketLink) {
    return <Link href={ticketLink}>{content}</Link>;
  }
  return <div>{content}</div>;
}

// ─── Filter tabs ─────────────────────────────────────────────────────────
const FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Belum Dibaca", value: "unread" },
  { label: "Tiket", value: "ticket" },
  { label: "Chat", value: "chat" },
  { label: "Akun", value: "account" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function matchFilter(n: Notification, f: FilterValue): boolean {
  if (f === "all") return true;
  if (f === "unread") return !n.read_at;
  if (f === "ticket") return n.type === "ticket_created" || n.type === "ticket_status_changed";
  if (f === "chat") return n.type === "chat_received";
  if (f === "account") return ["profile_updated", "password_changed", "avatar_updated"].includes(n.type);
  return true;
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, deleteNotification, clearRead } =
    useNotifications();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = notifications.filter((n) => matchFilter(n, filter));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success("Semua notifikasi ditandai sudah dibaca");
  };

  const handleClearRead = async () => {
    await clearRead();
    toast.success("Notifikasi yang sudah dibaca berhasil dihapus");
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#1ed760]" />
            Notifikasi
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#1ed760] text-black text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-[#333] text-gray-400 hover:text-white bg-transparent hover:bg-[#1f1f1f]"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="border-[#1ed760]/30 text-[#1ed760] hover:bg-[#1ed760]/10 bg-transparent"
            >
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Baca Semua
            </Button>
          )}
          {notifications.some((n) => n.read_at) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearRead}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Hapus Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => {
          const count =
            f.value === "unread"
              ? unreadCount
              : f.value === "all"
              ? notifications.length
              : notifications.filter((n) => matchFilter(n, f.value)).length;

          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f.value
                  ? "bg-[#1ed760] text-black"
                  : "bg-[#1a1a1a] border border-[#282828] text-gray-400 hover:text-white hover:border-[#444]"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    filter === f.value ? "bg-black/20" : "bg-[#282828]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#282828] flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Tidak ada notifikasi</p>
            <p className="text-gray-600 text-sm mt-1">
              {filter === "unread" ? "Semua sudah dibaca 🎉" : "Belum ada notifikasi untuk kategori ini"}
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotifCard
              key={n.id}
              notif={n}
              onRead={markRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
}
