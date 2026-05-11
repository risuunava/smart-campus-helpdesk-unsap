"use client";

import { useAuth } from "@/hooks/useAuth";
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
  X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Sidebar() {
  const { user, logout } = useAuth();
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
    ];
  }

  function getAdminMenu(isMaster: boolean) {
    const items = [
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#121212] border-r border-[#282828] z-50 transform transition-transform duration-200 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#282828]">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1ed760] rounded-full flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
                <Shield className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm tracking-wide">UNSAP</h1>
                <p className="text-xs text-[#b3b3b3]">Helpdesk</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-[#282828]">
            <div className="flex items-center gap-3 p-3 bg-[#1f1f1f] rounded-lg">
              <div className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background: user.role === "master_admin" ? "rgba(251, 191, 36, 0.15)" :
                             user.role === "admin" ? "rgba(168, 85, 247, 0.15)" :
                             "rgba(30, 215, 96, 0.15)"
                }}
              >
                {user.role === "master_admin" ? (
                  <Crown className="h-5 w-5 text-amber-400" />
                ) : user.role === "admin" ? (
                  <Shield className="h-5 w-5 text-purple-400" />
                ) : (
                  <User className="h-5 w-5 text-[#1ed760]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[#b3b3b3]">
                  {user.role === "master_admin" ? "Master Admin" : 
                   user.role === "admin" ? "Admin" : "Mahasiswa"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    item.active
                      ? "bg-[#1ed760]/10 text-[#1ed760] font-semibold"
                      : "text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f]"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    item.active ? "text-[#1ed760]" :
                    item.highlight ? "text-[#1ed760]" : ""
                  }`} />
                  <span>{item.label}</span>
                  {item.active && (
                    <div className="ml-auto w-1 h-5 bg-[#1ed760] rounded-full" />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-[#282828]">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#b3b3b3] hover:text-[#f3727f] hover:bg-red-500/10 transition-all duration-150"
              onClick={() => {
                setIsMobileOpen(false);
                logout();
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}