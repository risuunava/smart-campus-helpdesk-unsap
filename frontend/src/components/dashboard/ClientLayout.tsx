"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useSidebar } from "@/hooks/useSidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <Header />
      <main className={`${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen pt-16 transition-all duration-300 ease-in-out`}>
        {children}
      </main>
    </div>
  );
}
