import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type OrderItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  sizeMl?: number;
};

export type Order = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  
  // Structured Address
  governorate: string;
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string | null;
  floor: string | null;
  landmark: string | null;
  deliveryNotes: string | null;
  
  address: string; // Formatted summary
  paymentMethod: string;
  totalPrice: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  user: { id: string; username: string; email: string } | null;
};

export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load orders');
  }
  return response.json();
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load order');
  }
  return response.json();
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to update order status');
  }
  return response.json();
}
