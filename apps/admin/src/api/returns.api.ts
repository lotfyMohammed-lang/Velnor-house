import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export interface ReturnRequest {
  id: string;
  userId: string;
  orderId: string;
  productId: string;
  productName: string;
  sizeMl: number;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  order: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export async function getAllReturnRequests(): Promise<ReturnRequest[]> {
  const response = await fetch(`${API_BASE_URL}/returns/admin/all`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch return requests');
  }

  return response.json();
}

export async function updateReturnStatus(id: string, status: 'approved' | 'rejected'): Promise<ReturnRequest> {
  const response = await fetch(`${API_BASE_URL}/returns/admin/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update return status');
  }

  return response.json();
}
