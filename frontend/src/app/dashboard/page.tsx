"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

/**
 * /dashboard — Fallback redirect page.
 * Redirects based on the authenticated user's role.
 * Does NOT use AuthProvider context; reads token directly from API client.
 */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const token = api.getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const user = await api.getUser();
        switch (user.role) {
          case "admin":
          case "master_admin":
            router.replace("/admin");
            break;
          case "mahasiswa":
          default:
            router.replace("/mahasiswa");
            break;
        }
      } catch {
        router.replace("/login");
      }
    }

    redirect();
  }, [router]);

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
