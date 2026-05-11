import { API_BASE_URL } from './client';

export interface CreateOrderPayload {
  fullName: string;
  email: string;
  phone: string;
  
  // Structured Address
  governorate: string;
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  floor?: string;
  landmark?: string;
  deliveryNotes?: string;
  
  paymentMethod: string;
  totalPrice: number;
  appliedPromoCode?: string;
  discountAmount?: number;
  saveAddress?: boolean;
  addressLabel?: string;
  items: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    sizeMl?: number;
    productType?: string;
    quantity: number;
    image: string;
  }[];
}

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create order');
  }

  return data;
}

export async function getMyOrders() {
  const response = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
}
