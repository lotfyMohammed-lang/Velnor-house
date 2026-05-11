import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type User = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  country: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskDetail = {
  id: number;
  title: string;
  status: string;
  priority: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type ProjectDetail = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  tasks: TaskDetail[];
};

export type OrderDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  createdAt: string;
};

export type UserDetail = User & {
  projects: ProjectDetail[];
  orders: OrderDetail[];
  stats: {
    totalProjects: number;
    totalTasks: number;
    totalOrders: number;
  };
};

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  phone?: string;
};

export type UpdateUserPayload = {
  username?: string;
  email?: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  country?: string | null;
};

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load users');
  }

  return response.json();
}

export async function getUserById(id: string): Promise<UserDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load user');
  }

  return response.json();
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to create user');
  }

  return response.json();
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to update user');
  }

  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to delete user');
  }
}
