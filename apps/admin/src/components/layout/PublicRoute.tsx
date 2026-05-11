import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/lib/auth';

export function PublicRoute() {
  const { isAuthenticated } = useAdminAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
