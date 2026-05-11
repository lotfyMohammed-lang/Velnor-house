import { API_BASE_URL } from './client';

export interface UserAddress {
  id: string;
  label: string;
  governorate: string;
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string | null;
  floor: string | null;
  landmark: string | null;
  deliveryNotes: string | null;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  label: string;
  governorate: string;
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  floor?: string;
  landmark?: string;
  deliveryNotes?: string;
  phone: string;
  isDefault?: boolean;
}

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyAddresses(): Promise<UserAddress[]> {
  const response = await fetch(`${API_BASE_URL}/addresses/my`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch addresses');
  }

  return response.json();
}

export async function createAddress(payload: CreateAddressPayload): Promise<UserAddress> {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create address');
  }

  return response.json();
}

export async function setDefaultAddress(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/addresses/${id}/default`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to set default address');
  }
}

export async function deleteAddress(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete address');
  }
}
