import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/hooks/useSidebar";
import { ClientLayout } from "@/components/dashboard/ClientLayout";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cachedUserStr = cookieStore.get("cached_user")?.value;
  let initialUser = null;

  if (cachedUserStr) {
    try {
      const decodedStr = decodeURIComponent(cachedUserStr);
      initialUser = JSON.parse(decodedStr);
    } catch (e) {
      // ignore parse error
    }
  }

  return (
    <AuthProvider initialUser={initialUser}>
      <SidebarProvider>
        <ClientLayout>
          {children}
        </ClientLayout>
      </SidebarProvider>
    </AuthProvider>
  );
}