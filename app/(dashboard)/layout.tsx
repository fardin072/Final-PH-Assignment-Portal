import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardNav />
      <main className="ml-64 flex-1 p-6">
        {children}
      </main>
    </ProtectedRoute>
  );
}