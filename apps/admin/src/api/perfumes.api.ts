import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type PerfumeSize = {
  sizeMl: number;
  costPrice: number;
  price: number;
  stock: number;
};

export type Perfume = {
  id: string;
  name: string;
  brand: string;
  description: string;
  currency: string;
  sizes: PerfumeSize[];
  type: string;
  metadata: Record<string, any>;
  category: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePerfumePayload = {
  name: string;
  brand: string;
  description: string;
  currency?: string;
  sizes: PerfumeSize[];
  type: string;
  metadata: Record<string, any>;
  category: string;
  imageUrl: string;
  tags?: string[];
  featured?: boolean;
  bestseller?: boolean;
};

export type UpdatePerfumePayload = Partial<CreatePerfumePayload>;

export async function getPerfumes(): Promise<Perfume[]> {
  const response = await fetch(`${API_BASE_URL}/admin/perfumes`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load perfumes');
  }

  return response.json();
}

export async function createPerfume(payload: CreatePerfumePayload): Promise<Perfume> {
  const response = await fetch(`${API_BASE_URL}/admin/perfumes`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to create perfume');
  }

  return response.json();
}

export async function updatePerfume(id: string, payload: UpdatePerfumePayload): Promise<Perfume> {
  const response = await fetch(`${API_BASE_URL}/admin/perfumes/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to update perfume');
  }

  return response.json();
}

export async function deletePerfume(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/perfumes/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to delete perfume');
  }
}

export async function uploadImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const headers = getAdminHeaders();
  // Remove Content-Type so the browser sets it with the boundary
  const { 'Content-Type': _, ...uploadHeaders } = headers as any;

  const response = await fetch(`${API_BASE_URL}/admin/perfumes/upload`, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to upload image');
  }

  return response.json();
}
