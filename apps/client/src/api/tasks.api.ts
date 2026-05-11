import { API_BASE_URL } from './client';

function getAuthHeaders() {
  const token = localStorage.getItem('todolo_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAllTasks() {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return res.json();
}

export async function fetchTasks(projectId: number) {
  const res = await fetch(`${API_BASE_URL}/tasks?projectId=${projectId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return res.json();
}

export async function getTasks(projectId?: number) {
  if (projectId) {
    return fetchTasks(projectId);
  }
  return fetchAllTasks();
}

export async function createTask(data: {
  projectId: number;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  position?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create task');
  }

  return res.json();
}

export async function updateTask(
  id: number,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    startDate?: string | null;
    endDate?: string | null;
    position?: number;
  }
) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update task');
  }

  return res.json();
}

export async function reorderTask(
  id: number,
  data: {
    status: string;
    position: number;
  }
) {
  return updateTask(id, data);
}

export async function deleteTask(id: number) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to delete task');
  }

  return res.json();
}