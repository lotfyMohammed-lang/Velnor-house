import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';

import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { AdminsPage } from '@/pages/AdminsPage';
import { AdminDetailPage } from '@/pages/AdminDetailPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { RegisterAdminPage } from '@/pages/RegisterAdminPage';
import { ReturnsPage } from '@/pages/ReturnsPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import { FinancePage } from '@/pages/FinancePage';
import PromoCodesPage from '@/pages/PromoCodesPage';
import { CommunicationSettingsPage } from '@/pages/CommunicationSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/promos" element={<PromoCodesPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/settings" element={<CommunicationSettingsPage />} />
                <Route path="/admins" element={<AdminsPage />} />
                <Route path="/admins/:id" element={<AdminDetailPage />} />
                <Route path="/register-admin" element={<RegisterAdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
