import { API_BASE_URL } from './client';

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/* ========================= GET ALL ========================= */
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch projects');
  }

  return Array.isArray(data) ? data : data?.projects ?? [];
}

/* ========================= GET ONE ========================= */
export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch project');
  }

  return data?.project ?? data;
}

/* ========================= CREATE ========================= */
export async function createProject(data: {
  name: string;
  description?: string;
  color?: string;
}): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || 'Failed to create project');
  }

  return result?.project ?? result;
}

/* ========================= UPDATE ========================= */
export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
  }
): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || 'Failed to update project');
  }

  return result?.project ?? result;
}

/* ========================= DELETE ========================= */
export async function deleteProject(
  id: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || 'Failed to delete project');
  }

  return result ?? { message: 'Project deleted successfully' };
}