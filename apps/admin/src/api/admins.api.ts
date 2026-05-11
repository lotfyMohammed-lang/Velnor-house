import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateAdminPayload = {
  name?: string;
  email?: string;
  role?: string;
};

export async function getAdmins(): Promise<AdminUser[]> {
  const response = await fetch(`${API_BASE_URL}/admin/admins`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load admins');
  }

  return response.json();
}

export async function getAdminById(id: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load admin');
  }

  return response.json();
}

export async function updateAdmin(id: string, payload: UpdateAdminPayload): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to update admin');
  }

  return response.json();
}

export async function deleteAdmin(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to delete admin');
  }
}
