import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminNavigation from "./AdminNavigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-background">
        <AdminNavigation />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 