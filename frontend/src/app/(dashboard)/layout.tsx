"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider, useSidebar } from "@/hooks/useSidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </SidebarProvider>
    </AuthProvider>
  );
}