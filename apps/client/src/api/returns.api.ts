import { API_BASE_URL } from './client';

export interface CreateReturnPayload {
  orderId: string;
  productId: string;
  productName: string;
  sizeMl: number;
  quantity: number;
  reason: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createReturnRequest(payload: CreateReturnPayload) {
  const response = await fetch(`${API_BASE_URL}/returns`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create return request');
  }

  return data;
}

export async function getMyReturns() {
  const response = await fetch(`${API_BASE_URL}/returns`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch return requests');
  }

  return response.json();
}
