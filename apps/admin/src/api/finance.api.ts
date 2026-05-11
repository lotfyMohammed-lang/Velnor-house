import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type FinanceSummary = {
  totalRevenue: number;
  returnExpenses: number;
  netRevenue: number;
  totalOrders: number;
  approvedReturnsCount: number;
  pendingReturnsCount: number;
};

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const response = await fetch(`${API_BASE_URL}/admin/finance/summary`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load finance summary');
  }

  return response.json();
}
