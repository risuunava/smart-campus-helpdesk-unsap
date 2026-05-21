"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useSidebar } from "@/hooks/useSidebar";
import { Notification, NotificationType } from "@/types";
import { 
  Bell, 
  Settings, 
  User, 
  LogOut,
  CheckCheck,
  Ticket,
  MessageSquare,
  Lock,
  Camera,
  ShieldCheck,
  X,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─── icon per tipe notifikasi ─────────────────────────────────────────────
const typeIcon: Record<NotificationType, React.ReactNode> = {
  ticket_created:        <Ticket className="w-3.5 h-3.5 text-[#1ed760]" />,
  ticket_status_changed: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />,
  chat_received:         <MessageSquare className="w-3.5 h-3.5 text-purple-400" />,
  profile_updated:       <User className="w-3.5 h-3.5 text-amber-400" />,
  password_changed:      <Lock className="w-3.5 h-3.5 text-red-400" />,
  avatar_updated:        <Camera className="w-3.5 h-3.5 text-pink-400" />,
};

function NotifDropdownItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isUnread = !notif.read_at;
  const timeAgo = formatDistanceToNow(new Date(notif.created_at), {
    addSuffix: true,
    locale: idLocale,
  });

  const inner = (
    <div
      className={`flex gap-2.5 px-3 py-2.5 group relative transition-colors cursor-pointer ${
        isUnread ? "bg-[#1ed760]/5 hover:bg-[#1ed760]/10" : ""
      }`}
      style={!isUnread ? { background: 'transparent' } : undefined}
      onMouseEnter={(e) => { if (!isUnread) e.currentTarget.style.background = 'var(--th-hover)'; }}
      onMouseLeave={(e) => { if (!isUnread) e.currentTarget.style.background = 'transparent'; }}
      onClick={() => isUnread && onRead(notif.id)}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'var(--th-raised)' }}>
        {typeIcon[notif.type]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: isUnread ? 'var(--th-text-primary)' : 'var(--th-text-secondary)' }}>
          {notif.title}
          {isUnread && (
            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#1ed760] align-middle" />
          )}
        </p>
        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--th-text-muted)' }}>{notif.body}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-faint)' }}>{timeAgo}</p>
      </div>

      {/* Delete button */}
      <button
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 hover:text-red-400 transition-all mt-0.5"
        style={{ color: 'var(--th-text-faint)' }}
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        title="Hapus"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  if (notif.ticket_id) {
    return (
      <Link href={`/mahasiswa/tiket/${notif.ticket_id}`} onClick={() => isUnread && onRead(notif.id)}>
        {inner}
      </Link>
    );
  }
  return inner;
}

export function Header() {
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();
  const { isCollapsed } = useSidebar();

  if (!user) return null;

  // Hanya tampilkan 6 notif terbaru di dropdown
  const preview = notifications.slice(0, 6);

  return (
    <header 
      className={`fixed top-0 left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-64'} right-0 h-16 backdrop-blur-md border-b z-40 px-6 md:px-8 flex items-center justify-end transition-all duration-300 ease-in-out`}
      style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}
    >
      <div className="flex items-center gap-3">

        {/* ── Bell Dropdown ─────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="notification-bell"
              className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none"
              style={{ color: 'var(--th-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--th-text-primary)'; e.currentTarget.style.background = 'var(--th-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--th-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-[#1ed760] text-black text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border-2" style={{ borderColor: 'var(--th-header-bg)' }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 p-0 overflow-hidden shadow-2xl"
            style={{ background: 'var(--th-base)', borderColor: 'var(--th-border)' }}
          >
            {/* Header dropdown */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--th-border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1ed760]" />
                <span className="text-sm font-semibold" style={{ color: 'var(--th-text-primary)' }}>Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#1ed760] text-black text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-[11px] text-[#1ed760] hover:text-[#1ed760]/80 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Baca Semua
                </button>
              )}
            </div>

            {/* Notif list */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {preview.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="w-8 h-8 mb-2" style={{ color: 'var(--th-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Tidak ada notifikasi</p>
                </div>
              ) : (
                preview.map((n) => (
                  <NotifDropdownItem
                    key={n.id}
                    notif={n}
                    onRead={markRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t p-2" style={{ borderColor: 'var(--th-border-subtle)' }}>
                <Link
                  href="/notifications"
                  className="flex items-center justify-center w-full py-1.5 text-xs text-[#1ed760] hover:text-[#1ed760]/80 transition-colors font-medium"
                >
                  Lihat semua notifikasi →
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── Profile Dropdown ──────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none ml-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#1ed760]/10 flex items-center justify-center border border-[#1ed760]/30 hover:border-[#1ed760]/80 transition-colors overflow-hidden">
                {user.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.name} 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <User className="h-5 w-5 text-[#1ed760]" />
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ background: 'var(--th-base)', borderColor: 'var(--th-border)', color: 'var(--th-text-primary)' }}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none" style={{ color: 'var(--th-text-secondary)' }}>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: 'var(--th-border-subtle)' }} />
            <DropdownMenuItem asChild className="cursor-pointer" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--th-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--th-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer" style={{ cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--th-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <Link href="/notifications" className="flex items-center w-full">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-[#1ed760] text-black text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: 'var(--th-border-subtle)' }} />
            <DropdownMenuItem 
              className="text-red-500 hover:text-red-400 cursor-pointer"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }} 
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
