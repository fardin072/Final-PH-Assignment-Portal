import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardNav>{children}</DashboardNav>
    </ProtectedRoute>
  );
}