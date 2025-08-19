import AdminRouteGuard from "./AdminRouteGuard";
import AdminLayout from "./AdminLayout";

interface AdminPageWrapperProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function AdminPageWrapper({ children, currentPage }: AdminPageWrapperProps) {
  return (
    <AdminRouteGuard>
      <AdminLayout currentPage={currentPage}>
        {children}
      </AdminLayout>
    </AdminRouteGuard>
  );
}
