import { API_BASE_URL } from './client';

export type Profile = {
  id?: string;
  username: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  country?: string | null;
};

export type UpdateProfilePayload = {
  username?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  country?: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getProfile(): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load profile');
  }

  return data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error: any = new Error(data?.message || 'Failed to update profile');
    error.data = data;
    throw error;
  }

  return data;
}