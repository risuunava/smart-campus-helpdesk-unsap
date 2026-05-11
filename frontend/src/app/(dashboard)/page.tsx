"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * /dashboard — Entry point setelah login.
 * Otomatis redirect ke sub-dashboard yang sesuai dengan role user.
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
      case "mahasiswa":
        router.replace("/mahasiswa");
        break;
      case "admin":
        router.replace("/admin");
        break;
      case "master_admin":
        router.replace("/admin");
        break;
      default:
        router.replace("/login");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#1ed760] rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-[#1ed760]/20">
          <Loader2 className="h-8 w-8 text-black animate-spin" />
        </div>
        <p className="text-[#b3b3b3] font-medium">Mengarahkan ke dashboard...</p>
      </div>
    </div>
  );
}
