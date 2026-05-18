"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useSidebar } from "@/hooks/useSidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  BookOpen, 
  Brain, 
  BarChart3,
  LogOut,
  User,
  Shield,
  Crown,
  Menu,
  X,
  Settings,
  Bell,
  PanelLeft,
  PanelRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  interface MenuItem {
    label: string;
    icon: any;
    href: string;
    active: boolean;
    highlight?: boolean;
    badge?: number;
  }

  const isAdmin = user.role === "admin" || user.role === "master_admin";
  const isMasterAdmin = user.role === "master_admin";

  const menuItems: MenuItem[] = isAdmin ? getAdminMenu(isMasterAdmin) : getMahasiswaMenu();

  function getMahasiswaMenu() {
    return [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/mahasiswa",
        active: pathname === "/mahasiswa",
      },
      {
        label: "Buat Laporan",
        icon: PlusCircle,
        href: "/mahasiswa/buat-laporan",
        active: pathname === "/mahasiswa/buat-laporan",
        highlight: true,
      },
      {
        label: "Tiket Saya",
        icon: Ticket,
        href: "/mahasiswa/tiket-saya",
        active: pathname.startsWith("/mahasiswa/tiket"),
      },
      {
        label: "Notifikasi",
        icon: Bell,
        href: "/notifications",
        active: pathname === "/notifications",
        badge: unreadCount,
      },
      {
        label: "Pengaturan",
        icon: Settings,
        href: "/settings",
        active: pathname.startsWith("/settings"),
      },
    ];
  }

  function getAdminMenu(isMaster: boolean) {
    const items: MenuItem[] = [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
        active: pathname === "/admin",
      },
      {
        label: "Semua Tiket",
        icon: Ticket,
        href: "/admin/tiket",
        active: pathname.startsWith("/admin/tiket"),
      },
      {
        label: "Kelola FAQ",
        icon: BookOpen,
        href: "/admin/faq",
        active: pathname === "/admin/faq",
      },
    ];

    if (isMaster) {
      items.push(
        {
          label: "Campus Mood",
          icon: BarChart3,
          href: "/admin/campus-mood",
          active: pathname === "/admin/campus-mood",
        },
        {
          label: "AI Training",
          icon: Brain,
          href: "/admin/ml-corrections",
          active: pathname === "/admin/ml-corrections",
        }
      );
    }

    items.push(
      {
        label: "Notifikasi",
        icon: Bell,
        href: "/notifications",
        active: pathname === "/notifications",
        badge: unreadCount,
      },
      {
        label: "Pengaturan",
        icon: Settings,
        href: "/settings",
        active: pathname.startsWith("/settings"),
      }
    );

    return items;
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1f1f1f] rounded-full shadow-lg border border-[#282828]"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-[#121212] border-r border-[#282828] z-50 transform transition-all duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#282828] flex items-center justify-between relative">
            <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'mx-auto' : ''}`}>
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <Image 
                  src="/images/hd-logo.png" 
                  alt="UNSAP Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="leading-tight">
                  <h1 className="font-bold text-white text-sm tracking-wide">UNSAP</h1>
                  <p className="text-[11px] text-[#b3b3b3]">Helpdesk</p>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button 
                onClick={toggleSidebar} 
                className="hidden lg:flex absolute right-4 text-gray-400 hover:text-white transition-colors"
                title="Tutup Sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {isCollapsed && (
            <div className="hidden lg:flex justify-center p-3 border-b border-[#282828]">
              <button 
                onClick={toggleSidebar} 
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#1f1f1f]"
                title="Buka Sidebar"
              >
                <PanelRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* User Info */}
          <div className={`p-4 border-b border-[#282828] transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center gap-3 p-3 bg-[#1f1f1f] rounded-lg transition-all duration-300 ${isCollapsed ? 'w-full justify-center px-0 bg-transparent' : ''}`}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{
                  background: user.avatar_url ? 'transparent' : (user.role === "master_admin" ? "rgba(251, 191, 36, 0.15)" :
                             user.role === "admin" ? "rgba(168, 85, 247, 0.15)" :
                             "rgba(30, 215, 96, 0.15)")
                }}
              >
                {user.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.name} 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : user.role === "master_admin" ? (
                  <Crown className="h-5 w-5 text-amber-400" />
                ) : user.role === "admin" ? (
                  <Shield className="h-5 w-5 text-purple-400" />
                ) : (
                  <User className="h-5 w-5 text-[#1ed760]" />
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#b3b3b3]">
                    {user.role === "master_admin" ? "Master Admin" : 
                     user.role === "admin" ? "Admin" : "Mahasiswa"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href} onClick={() => setIsMobileOpen(false)} title={isCollapsed ? item.label : undefined}>
                <div
                  className={`flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                    item.active
                      ? "bg-[#1ed760]/10 text-[#1ed760] font-semibold"
                      : "text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f]"
                  } relative`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${
                    item.active ? "text-[#1ed760]" :
                    item.highlight ? "text-[#1ed760]" : ""
                  }`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  
                  {!isCollapsed && item.badge && item.badge > 0 ? (
                    <span className="ml-auto px-1.5 py-0.5 bg-[#1ed760] text-black text-[10px] font-bold rounded-full min-w-[18px] text-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : !isCollapsed && item.active ? (
                    <div className="ml-auto w-1 h-5 bg-[#1ed760] rounded-full" />
                  ) : null}

                  {isCollapsed && item.badge && item.badge > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#1ed760] rounded-full" />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-[#282828]">
            <button
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm text-[#b3b3b3] hover:text-[#f3727f] hover:bg-red-500/10 transition-all duration-150 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
              onClick={() => {
                setIsMobileOpen(false);
                logout();
              }}
              title={isCollapsed ? "Keluar" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}