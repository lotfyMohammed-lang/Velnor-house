import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type DashboardStats = {
  totalUsers: number;
  newUsersLast7Days: number;
  totalPerfumes: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  returnExpenses: number;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    fullName: string;
    totalPrice: number;
    status: string;
    itemCount: number;
    createdAt: string;
    user: { id: string; username: string } | null;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load dashboard');
  }

  return response.json();
}