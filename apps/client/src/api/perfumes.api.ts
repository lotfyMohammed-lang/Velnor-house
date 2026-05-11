import { API_BASE_URL } from './client';

export interface PerfumeSize {
  sizeMl: number;
  price: number;
  stock: number;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  description: string;
  currency: string;
  sizes: PerfumeSize[];
  type: string;
  category: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getPerfumes(): Promise<Perfume[]> {
  const response = await fetch(`${API_BASE_URL}/perfumes`);

  if (!response.ok) {
    throw new Error('Failed to fetch perfumes');
  }

  return response.json();
}

export async function getPerfumeById(id: string): Promise<Perfume> {
  const response = await fetch(`${API_BASE_URL}/perfumes/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch perfume details');
  }

  return response.json();
}

export async function createPerfume(perfumeData: Partial<Perfume>): Promise<Perfume> {
  const response = await fetch(`${API_BASE_URL}/perfumes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(perfumeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create perfume');
  }

  return response.json();
}

export async function updatePerfume(id: string, perfumeData: Partial<Perfume>): Promise<Perfume> {
  const response = await fetch(`${API_BASE_URL}/perfumes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(perfumeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update perfume');
  }

  return response.json();
}

export async function deletePerfume(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/perfumes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete perfume');
  }
}