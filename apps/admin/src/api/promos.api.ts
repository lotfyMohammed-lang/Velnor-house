import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount: number;
  isActive: boolean;
  createdAt: string;
}

export const promosApi = {
  getAll: async (): Promise<PromoCode[]> => {
    const response = await fetch(`${API_BASE_URL}/promos/admin`, {
      headers: getAdminHeaders(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to load promo codes');
    }

    return response.json();
  },

  create: async (payload: Partial<PromoCode>): Promise<PromoCode> => {
    const response = await fetch(`${API_BASE_URL}/promos/admin`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to create promo code');
    }

    return response.json();
  },

  toggleStatus: async (id: string): Promise<PromoCode> => {
    const response = await fetch(`${API_BASE_URL}/promos/admin/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to update status');
    }

    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/promos/admin/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || 'Failed to delete promo code');
    }
  },
};
